<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;


class ClientsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        DB::table('Clients')->insert([
            'name' => 'taylor',
            'email' => 'userteste@teste.com',
            'password' => Hash::make('12345'),
        ]);
    }
}
