using System.ComponentModel.DataAnnotations;

namespace SecretAlbum
{
    public class Album
    {
        [Key]
        public string AlbumId { get; set; }
        public string UserAlias { get; set; }
        public string VerifyKey { get; set; }
    }
}