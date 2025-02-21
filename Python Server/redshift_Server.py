from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import psycopg2
from psycopg2 import sql
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Definir o token fixo
BEARER_TOKEN = "seu_token_fixo_aqui"

# Inicializar o FastAPI
app = FastAPI()

# Criar um objeto HTTPBearer para autenticação
security = HTTPBearer()

# Função para verificar o Bearer Token
def verificar_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != BEARER_TOKEN:
        raise HTTPException(
            status_code=401,
            detail="Token inválido"
        )

# Definir o modelo de dados para o corpo da requisição POST (com query SQL)
class QuerySQL(BaseModel):
    query: str

# Função para conectar ao banco de dados
def conectar_redshift():
    try:
        conn = psycopg2.connect(
            dbname="dev",
            user="av-admin",
            password="Pacheco25!",
            host="av-redshift-cluster-development.cngeaifopw3u.us-east-1.redshift.amazonaws.com",
            port="5439"
        )
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao conectar ao banco: {e}")

# Rota GET para executar um update dinâmico de acordo com a query fornecida no JSON
@app.get("/update_cliente")
def update_cliente(query_data: QuerySQL, token: str = Depends(verificar_token)):
    query_decodificada = query_data.query
    
    conn = conectar_redshift()
    cursor = conn.cursor()
    try:
        # Executar a query de update fornecida
        cursor.execute(query_decodificada)
        conn.commit()
        return {"message": f"Update realizado com sucesso! Query: {query_decodificada}"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao executar a query: {e}")
    finally:
        cursor.close()
        conn.close()
