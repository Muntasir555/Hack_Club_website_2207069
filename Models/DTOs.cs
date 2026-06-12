namespace HackClub.Models
{
    public class RegisterDto
    {
        public string StudentId { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public string Department { get; set; }
        public string Year { get; set; }
        public string Semester { get; set; }
    }

    public class LoginDto
    {
        public string StudentId { get; set; }
        public string Password { get; set; }
    }

    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
    }
}
