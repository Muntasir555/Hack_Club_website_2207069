using System.Security.Claims;
using HackClub.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using System.IO;
namespace HackClub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdStr == null) return Unauthorized();
            
            var userId = int.Parse(userIdStr);

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            var contributions = await _context.Contributions
                .Include(c => c.Project)
                .Where(c => c.UserId == userId)
                .Select(c => new
                {
                    ProjectTitle = c.Project.Title,
                    c.Details
                })
                .ToListAsync();

            return Ok(new
            {
                user.Name,
                user.StudentId,
                user.Department,
                user.Year,
                user.Semester,
                user.Role,
                user.ProfilePicturePath,
                Contributions = contributions
            });
        }

        [HttpPost("upload-profile-picture")]
        public async Task<IActionResult> UploadProfilePicture([FromForm] IFormFile file)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdStr == null) return Unauthorized();
            
            var userId = int.Parse(userIdStr);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest("Invalid image format.");
            }

            if (file.Length > 5 * 1024 * 1024) return BadRequest("File size exceeds 5MB limit.");

            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "profiles");
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            var fileName = $"{userId}_{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            if (!string.IsNullOrEmpty(user.ProfilePicturePath))
            {
                var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.ProfilePicturePath.TrimStart('/'));
                if (System.IO.File.Exists(oldFilePath))
                {
                    System.IO.File.Delete(oldFilePath);
                }
            }

            user.ProfilePicturePath = $"/images/profiles/{fileName}";
            await _context.SaveChangesAsync();

            return Ok(new { profilePicturePath = user.ProfilePicturePath });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] Models.ChangePasswordDto dto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdStr == null) return Unauthorized();
            
            var userId = int.Parse(userIdStr);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            if (user.PasswordHash != dto.CurrentPassword)
            {
                return BadRequest(new { message = "Incorrect current password." });
            }

            user.PasswordHash = dto.NewPassword; // In a real app, hash this!
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password updated successfully." });
        }
    }
}
