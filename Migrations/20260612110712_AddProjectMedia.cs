using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hack_Club_website.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectMedia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MediaPath",
                table: "Projects",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MediaPath",
                table: "Projects");
        }
    }
}
