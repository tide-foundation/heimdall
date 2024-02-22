// FieldData on Heimdall turns into Datum on enclave
export class FieldData {
    /**
     * These identifiers must ALWAYS - EVERY TIME HEIMDALL IS CALLED FROM THIS VENDOR - be supplied in the SAME ORDER. APPEND list for new identifiers
     * @param {string[]} identifiers 
     */
    constructor(identifiers){
        if(identifiers.length > 255) throw Error("Heimdall: Too many identifiers provided for FieldData");
        if(identifiers.length == 0) throw Error("Identifiers list required to convert tags to ids");
        this.identifiers = identifiers
        this.datas = []
    }

    /**
     * @param {Uint8Array} data 
     * @param {string[]} ids 
     */
    add(data, ids){
        const tag = this.getTag(ids);
        this.addWithTag(data, tag);
    }

    /**
     * @param {Uint8Array} data 
     * @param {number} tag 
     */
    addWithTag(data, tag){
        let datum = {
            Data: serializeUint8Array(data),
            Tag: tag
        }
        this.datas.push(datum);
    }

    /**
     * @param {object[]} fieldDatas 
     */
    addManyWithTag(fieldDatas){
        if(this.datas.length > 0) throw Error("This FieldData object already has objects in its contents");
        this.datas = fieldDatas.map(fd => {
            if(!fd.Data || !fd.Tag) throw Error("Invalid field data supplied");
            return {
                Data: deserializeUint8Array(fd.Data),
                Tag: fd.Tag
            };
        })
    }

    getAll(){
        return [...this.datas];
    }

    getAllWithIds(){
        return this.datas.map(da => {
            const datum = {
                Data: da.Data,
                Ids: this.getIds(da.Tag)
            }
            return datum;
        })
    }

    /**
     * @param {string[]} ids 
     */
    getTag(ids){
        let tag = 0; // its basically a mask
        ids.forEach(id => {
            // get index of id in id list
            const index = this.identifiers.indexOf(id);
            if(index == -1) throw Error("Id not found in identifiers");
            const mask = 1 << (index);
            tag |= mask;
        });
        return tag;
    }
    /**
     * @param {number} tag 
     */
    getIds(tag){
        const bitLen = this.identifiers.length;
        let ids = [];
        for(let i = 0; i < bitLen; i++){
            const mask = 1 << i;
            if((tag & mask) != 0){
                const id = this.identifiers[i];
                ids.push(id);
            }
        }
        return ids;
    }
}