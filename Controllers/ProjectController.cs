using System.Security.Claims;
using HackClub.Data;
using HackClub.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HackClub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProjectController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddProject([FromForm] string title, [FromForm] string? description, [FromForm] IFormFile? media)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdStr == null) return Unauthorized();
            var userId = int.Parse(userIdStr);

            if (string.IsNullOrWhiteSpace(title)) return BadRequest("Title is required.");

            string? mediaPath = null;
            if (media != null && media.Length > 0)
            {
                var extension = Path.GetExtension(media.FileName).ToLowerInvariant();
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".webm" };
                if (!allowedExtensions.Contains(extension)) return BadRequest("Invalid media format.");
                if (media.Length > 50 * 1024 * 1024) return BadRequest("File size exceeds 50MB limit.");

                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "media", "projects");
                if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

                var fileName = $"{userId}_{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(folderPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await media.CopyToAsync(stream);
                }
                mediaPath = $"/media/projects/{fileName}";
            }

            var project = new Project
            {
                Title = title,
                Description = description,
                MediaPath = mediaPath
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            var contribution = new Contribution
            {
                UserId = userId,
                ProjectId = project.Id,
                Details = "Added project: " + title
            };

            _context.Contributions.Add(contribution);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Project added successfully." });
        }
    }
}
