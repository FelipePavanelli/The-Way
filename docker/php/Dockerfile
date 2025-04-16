FROM php:8.3-fpm

# Instala dependências
RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    locales \
    jpegoptim optipng pngquant gifsicle \
    git \
    curl \
    unzip \
    libzip-dev \
    libpq-dev \
    libxml2-dev \
    libonig-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Instala extensões PHP
RUN docker-php-ext-install pdo pdo_pgsql pgsql pdo_mysql mbstring ctype bcmath pcntl fileinfo exif zip xml gd

# Instala Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Cria usuário e grupo para o Laravel
RUN groupadd -g 1000 www && useradd -u 1000 -ms /bin/bash -g www www

# Copia o código do projeto e ajusta permissões
COPY --chown=www:www . /var/www

# Ajusta permissões
RUN chown -R www-data:www-data /var/www && chmod -R 777 /var/www

# Define o usuário
USER www

# Expõe a porta 9000 e inicia o PHP-FPM
EXPOSE 9000
CMD ["php-fpm"]
