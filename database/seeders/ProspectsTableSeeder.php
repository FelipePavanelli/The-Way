<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;


class ProspectsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        DB::table('Prospects')->insert([
            'name' => 'taylor',
            'email' => 'userteste@teste.com',
            'password' => Hash::make('12345'),
        ]);
    }
}
