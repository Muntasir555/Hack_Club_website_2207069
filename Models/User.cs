using System.ComponentModel.DataAnnotations;

namespace HackClub.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string StudentId { get; set; } // Username
        
        [Required]
        public string PasswordHash { get; set; }
        
        [Required]
        public string Name { get; set; }
        
        public string? Department { get; set; }
        
        public string? Year { get; set; }
        
        public string? Semester { get; set; }
        
        public string Status { get; set; } = "Pending"; // Pending, Approved
        
        public string Role { get; set; } = "Member"; // Admin, Member

        public string? ProfilePicturePath { get; set; }
    }
}
