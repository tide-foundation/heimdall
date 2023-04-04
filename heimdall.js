// 
// Tide Protocol - Infrastructure for a TRUE Zero-Trust paradigm
// Copyright (C) 2022 Tide Foundation Ltd
// 
// This program is free software and is subject to the terms of 
// the Tide Community Open Code License as published by the 
// Tide Foundation Limited. You may modify it and redistribute 
// it in accordance with and subject to the terms of that License.
// This program is distributed WITHOUT WARRANTY of any kind, 
// including without any implied warranty of MERCHANTABILITY or 
// FITNESS FOR A PARTICULAR PURPOSE.
// See the Tide Community Open Code License for more details.
// You should have received a copy of the Tide Community Open 
// Code License along with this program.
// If not, see https://tide.org/licenses_tcoc2-0-0-en
//

import { SignUp, SignIn, Utils, AES, EdDSA, Hash, Point } from 'https://cdn.jsdelivr.net/gh/tide-foundation/Tide-h4x2-2@main/H4x2-Node/H4x2-Node/wwwroot/modules/H4x2-TideJS/index.js';

const default_config = {
    simulatorUrl: 'https://new-simulator.australiaeast.cloudapp.azure.com/',
    vendorUrl: 'https://h4x-staging-vendor.azurewebsites.net/',
    orkInfo: [["5808127961975072840730120281232685263417618832155339282190890201697908791972", "https://h4x22ork1.azurewebsites.net", Point.fromB64("Y2vmi+itUTFM274wgLy/lnN3fALb3Xxx7WcWmYDbpGo=")], ["6060359592009284245073448088087911020375701223998815058548250639320834741576", "https://h4x22ork2.azurewebsites.net", Point.fromB64("79rL7ctIjavR0YXYKKlZs50SHUSd5sQCAnVFqjtdiYs=")], ["5073901937251236517971199124385786860347787354666478658500118975417497976728", "https://h4x22ork3.azurewebsites.net", Point.fromB64("2+63QdM5yvJLTgzk/LkU8V0ZrGXTXKXnuJqMDQGp6zE=")], ["7073875926476656919665955070384988159576742891120726385034300563959686200724", "https://h4x22ork4.azurewebsites.net", Point.fromB64("hIV5nO1PiJOZhhUOtUAS4akzgSj/e9Bh3Cb4MPDnNTs=")], ["3151342255570713936569518107093186843135221613057314018445101493146463579599", "https://h4x22ork5.azurewebsites.net", Point.fromB64("gbbztnvnNrA1LraI1iYkt6vd3/CnbZFZmvkYSzmGl+I=")]]
} 

const signIn = new SignIn(default_config);
const signUp = new SignUp(default_config);

export { signIn, signUp, AES, Utils, EdDSA, Hash }