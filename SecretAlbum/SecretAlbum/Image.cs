using System.ComponentModel.DataAnnotations;

namespace SecretAlbum
{
    public class Image
    {
        [Key]
        public int Id { get; set; }
        public string AlbumId { get; set; }
        public string Description { get; set; }
        public string Seed { get; set; }
        public string PubKey { get; set; }
        public string EncryptedData { get; set; }
    }
}