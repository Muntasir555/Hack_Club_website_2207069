using System.Security.Claims;
using HackClub.Data;
using HackClub.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HackClub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.StudentId == dto.StudentId))
            {
                return BadRequest(new { message = "Student ID already exists." });
            }

            var user = new User
            {
                StudentId = dto.StudentId,
                PasswordHash = dto.Password, // In a real app, use BCrypt or similar
                Name = dto.Name,
                Department = dto.Department,
                Year = dto.Year,
                Semester = dto.Semester,
                Status = "Pending",
                Role = "Member"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration successful. Please wait for admin approval." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.StudentId == dto.StudentId);
            if (user == null || user.PasswordHash != dto.Password)
            {
                return Unauthorized(new { message = "Invalid ID or password." });
            }

            if (user.Status != "Approved")
            {
                return Unauthorized(new { message = "Your account is pending admin approval." });
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.StudentId),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity));

            return Ok(new { message = "Login successful", role = user.Role });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Logout successful" });
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            if (!User.Identity.IsAuthenticated)
            {
                return Unauthorized();
            }

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var user = await _context.Users.FindAsync(userId);

            if (user == null) return NotFound();

            return Ok(new
            {
                user.Id,
                user.StudentId,
                user.Name,
                user.Department,
                user.Role
            });
        }
    }
}
