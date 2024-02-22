/**
 * @param {string} endpoint 
 * @param {Object} form 
 * @returns 
 */
export async function POST(endpoint, form){
    // create form data first
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value)
    });
        
    const pre_resp = await fetch(endpoint, {
        method: 'POST',
        body: formData
    });
    const resp = await pre_resp.text();
    return resp;
}