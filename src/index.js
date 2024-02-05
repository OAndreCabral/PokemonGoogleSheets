// @ts-nocheck
require('dotenv').config();
const axios = require('axios');
const { google } = require('googleapis');
const express = require('express');
const app = express();

//confurar a api do google para planilha
const SPREADSHEET_ID = '1uJ1ows4O8Q4MUsLUZW7rQq5dJvfSwdEPF9wP7dMnM5U';
const API_KEY = 'e1dc9d85dd697c8e1e97204302c6b71ef62d8c18';

async function getPokemonNames() {
    let pokemonNames = [];
    for (let i = 1; i <= 100; i++) {
        try {
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${i}`);
            pokemonNames.push(response.data.name);
        } catch (error) {
            console.error(`Erro ao buscar nome do Pokémon:${error}`);
        }
    }
    return pokemonNames;
}

async function addNamesToSpreadsheet(names) {
    const auth = new google.auth.GoogleAuth({
        keyFile: './credentials.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    let row = [];
    let rows = [];
    for (const name of names) {
        row.push(name);
        if (row.length === 7) {
            rows.push(row);
            row = [];
        }
    }
    if (row.length > 0) {
        rows.push(row);
    }
    for (const row of rows) {
        try {
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Any',
                valueInputOption: 'RAW',
                resource: {
                    values: [row],
                },
            });
            console.log('Nomes adicionados');
        } catch (error) {
            console.error('Erro ao adicionar nomes:', error.message);
        }
    }
}

app.get('/addPokemonNames', async (request, response) => {
    const pokemonNames = await getPokemonNames();
    await addNamesToSpreadsheet(pokemonNames);
    response.send('Nomes dos Pokémons adicionados com sucesso!');
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});


