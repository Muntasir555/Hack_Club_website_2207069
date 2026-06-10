using Microsoft.EntityFrameworkCore;
using HackClub.Models;

namespace HackClub.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<Contribution> Contributions { get; set; }
    }
}
