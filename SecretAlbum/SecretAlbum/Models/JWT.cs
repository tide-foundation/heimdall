using H4x2_TinySDK.Math;
using H4x2_TinySDK.Tools;
using System.Text.Json;
using System.Text;
using H4x2_TinySDK.Ed25519;

namespace SecretAlbum.Models
{
    public class TideJWT
    {
        public Header header { get; set; }
        public Payload payload { get; set; }
        public string signature { get; set; }
        public TideJWT(string base64Url, bool signed = false)
        {
            string[] strings = base64Url.Split('.');
            header = JsonSerializer.Deserialize<Header>(Base64UrlDecodeToText(strings[0]));
            if (header.alg != "EdDSA") throw new Exception("TideJWT: Unknown algorithm requested for TideJWT");
            payload = JsonSerializer.Deserialize<Payload>(Base64UrlDecodeToText(strings[1]));
            if (signed) signature = Base64UrlDecodeToBase64(strings[2]);

        }
        public TideJWT(string VUID, string gSessKeyPub, string gVVK, long expTime)
        {
            header = new Header
            {
                alg = "EdDSA",
                typ = "JWT"
            };
            payload = new Payload
            {
                uid = VUID,
                exp = expTime,
                gSessKeyPub = gSessKeyPub,
                gVVK = gVVK
            };

        }
        public byte[] GetDataToSign()
        {
            string headerB64Url = Base64UrlEncode(JsonSerializer.Serialize(header));
            string payloadB64Url = Base64UrlEncode(JsonSerializer.Serialize(payload, new JsonSerializerOptions { Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping })); // issues with + in gSesskeyPub
            return Encoding.ASCII.GetBytes(headerB64Url + "." + payloadB64Url);                                                                                                                                              // client knows to expect json so its all g
        }
        /// <summary>
        /// Will verify that the JWT will expire within minutesToExp time.
        /// </summary>
        /// <param name="minutesToExp"></param>
        /// <returns></returns>
        public bool VerifyExpTime(long minutesToExp)
        {
            long epochNow_seconds = (long)(DateTimeOffset.UtcNow - new DateTimeOffset(1970, 1, 1, 0, 0, 0, TimeSpan.Zero)).TotalSeconds;
            if (payload.exp - epochNow_seconds > minutesToExp * 60) return false;
            return true;
        }
        public bool StillValid()
        {
            long currTime = (long)(DateTimeOffset.UtcNow - new DateTimeOffset(1970, 1, 1, 0, 0, 0, TimeSpan.Zero)).TotalSeconds;
            return currTime < this.payload.exp;
        }
        public bool VerifySignature(Point pub)
        {
            return EdDSA.Verify(GetDataToSign(), Convert.FromBase64String(this.signature), pub);
        }
        private string Base64UrlEncode(string text)
        {
            // Convert text to byte array and then to base64 string
            var base64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(text));

            // Replace base64 specific characters with URL safe characters and remove padding
            return base64.Replace('+', '-').Replace('/', '_').TrimEnd('=');
        }

        private string Base64UrlDecodeToText(string base64Url)
        {
            // Replace URL specific characters
            string padded = base64Url.Replace('-', '+').Replace('_', '/');
            switch (base64Url.Length % 4)
            {
                case 2: padded += "=="; break;
                case 3: padded += "="; break;
            }

            // Convert base64 string to byte array
            var bytes = Convert.FromBase64String(padded);

            // Convert byte array to text
            string text = Encoding.UTF8.GetString(bytes);
            return text;
        }
        public string Base64UrlDecodeToBase64(string base64Url)
        {
            // Replace URL specific characters
            string padded = base64Url.Replace('-', '+').Replace('_', '/');
            switch (base64Url.Length % 4)
            {
                case 2: padded += "=="; break;
                case 3: padded += "="; break;
            }

            return padded;
        }

        public class Header
        {
            public string alg { get; set; }
            public string typ { get; set; }
        }
        public class Payload
        {
            public string uid { get; set; }
            public long exp { get; set; }
            public string gSessKeyPub { get; set; }
            public string gVVK { get; set; }
        }
    }
}
