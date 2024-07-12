using System.ComponentModel.DataAnnotations;

namespace SecretAlbum
{
    public class Share
    {
        [Key]
        public int Id { get; set; }
        public string ImageId { get; set; }
        public string AlbumId { get; set; }
        public string ShareTo { get; set; }
        public string EncKey { get; set; }
    }
}