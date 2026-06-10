using System.Security.Claims;
using HackClub.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
                Contributions = contributions
            });
        }
    }
}
