using System.ComponentModel.DataAnnotations;

namespace HackClub.Models
{
    public class Notice
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; }
        
        [Required]
        public string Content { get; set; }
        
        public DateTime DatePosted { get; set; } = DateTime.UtcNow;
    }
}
