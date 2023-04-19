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

class KeyExchange{
    /**
     * Establish a shared session_key between 2 users (UIDs)
     * @param {BigInt} my_cvk  
     * @param {string} my_uid
     * @param {string} other_uid 
     */
    static async start(my_cvk, my_uid, other_uid){
        const session_key = Utils.bytesToBase64(window.crypto.getRandomValues(new Uint8Array(32))); // base64 AES Key

        const response = await fetch(`https://new-simulator.australiaeast.cloudapp.azure.com/keyentry/${other_uid}`);
        if(!response.ok) throw Error("Start Key Exchange: Could not find UID's entry at simulator");
        const resp_json = await response.json();
        const other_pub = Point.fromB64(resp_json.public);

        const DH_Key = await Hash.SHA256_Digest(other_pub.times(my_cvk).toArray());
        const encrypted_AES_Key = await AES.encryptData(session_key, DH_Key);

        const to_send = JSON.stringify({
            'sender_uid': my_uid,
            'session_key': encrypted_AES_Key
        });

        return {session_key, to_send};
    }

    /**
     * Establish a session key with another user who initiated it
     * @param {string} sent_data 
     * @param {BigInt} my_cvk 
     */
    static async establish(sent_data, my_cvk){
        const sent_data_obj = JSON.parse(sent_data);

        const response = await fetch(`https://new-simulator.australiaeast.cloudapp.azure.com/keyentry/${sent_data_obj.sender_uid}`);
        if(!response.ok) throw Error("Establish Key Exchange: Could not find UID's entry at simulator");
        const resp_json = await response.json();
        const other_pub = Point.fromB64(resp_json.public);

        const DH_Key = await Hash.SHA256_Digest(other_pub.times(my_cvk).toArray());
        const session_key = await AES.decryptData(sent_data_obj.session_key, DH_Key);

        const other_uid = sent_data_obj.sender_uid;
        return {session_key, other_uid};
    }

    /**
     * Securely store a session key on your browser. Session key encrypted with CVK.
     * @param {BigInt} my_cvk 
     * @param {string} other_uid 
     * @param {string} session_key 
     */
    static async store_session_key(my_cvk, other_uid, session_key){
        const encrypted_session_key = await AES.encryptData(session_key, my_cvk);
        window.localStorage.setItem("SK:" + other_uid, encrypted_session_key);
    }

    /**
     * Securely retrieve a session key previously established with another user.
     * @param {BigInt} my_cvk 
     * @param {string} other_uid 
     * @returns 
     */
    static async get_session_key(my_cvk, other_uid){
        const encrypted_session_key = window.localStorage.getItem("SK:" + other_uid);
        if(encrypted_session_key === null) throw Error("Get Session Key: No session key found for UID:" + other_uid);
        return await AES.decryptData(encrypted_session_key, my_cvk);
    }
}

const signIn = new SignIn(default_config);
const signUp = new SignUp(default_config);

export { signIn, signUp, AES, Utils, EdDSA, Hash, KeyExchange }