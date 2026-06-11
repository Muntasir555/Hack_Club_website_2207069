using HackClub.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HackClub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NoticesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NoticesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotices()
        {
            var notices = await _context.Notices
                .OrderByDescending(n => n.DatePosted)
                .ToListAsync();

            return Ok(notices);
        }
    }
}
