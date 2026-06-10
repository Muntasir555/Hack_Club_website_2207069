using HackClub.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HackClub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.StudentId,
                    u.Name,
                    u.Department,
                    u.Status,
                    u.Role
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPost("approve/{userId}")]
        public async Task<IActionResult> ApproveUser(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "User not found" });

            if (user.Status == "Approved")
                return BadRequest(new { message = "User is already approved" });

            user.Status = "Approved";
            await _context.SaveChangesAsync();

            return Ok(new { message = "User approved successfully" });
        }

        [HttpDelete("users/{userId}")]
        public async Task<IActionResult> RemoveUser(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "User not found" });

            if (user.Role == "Admin")
                return BadRequest(new { message = "Cannot remove an admin user" });

            _context.Users.Remove(user);
            
            // Remove associated contributions
            var contributions = _context.Contributions.Where(c => c.UserId == userId);
            _context.Contributions.RemoveRange(contributions);

            await _context.SaveChangesAsync();

            return Ok(new { message = "User removed successfully" });
        }
    }
}
