using System.ComponentModel.DataAnnotations;

namespace HackClub.Models
{
    public class Project
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; }
        
        public string? Description { get; set; }
    }
}
