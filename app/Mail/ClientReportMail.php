<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ClientReportMail extends Mailable
{
    use Queueable, SerializesModels;

    public $link;
    public $email;
    public $password;
    protected $session_id;

    /**
     * Create a new message instance.
     */
    public function __construct($session_id, $email, $password)
    {
        $this->session_id = $session_id;
        $this->email = $email;
        $this->password = $password;
        $this->link = env('LINK_RELATORIO') . '/relatorio-cliente/?sessionId=' . $session_id;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Dados de Acesso ao Planejamento Financeiro | The Way')
            ->view('emails.relatorio_cliente')
            ->with([
                'link' => $this->link,
                'email' => $this->email,
                'password' => $this->password,
            ]);
    }
}
