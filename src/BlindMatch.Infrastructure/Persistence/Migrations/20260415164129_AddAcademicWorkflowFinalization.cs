using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlindMatch.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAcademicWorkflowFinalization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FileName",
                schema: "dbo",
                table: "ProjectIterations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "FileSize",
                schema: "dbo",
                table: "ProjectIterations",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileType",
                schema: "dbo",
                table: "ProjectIterations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileUrl",
                schema: "dbo",
                table: "ProjectIterations",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FileName",
                schema: "dbo",
                table: "ProjectIterations");

            migrationBuilder.DropColumn(
                name: "FileSize",
                schema: "dbo",
                table: "ProjectIterations");

            migrationBuilder.DropColumn(
                name: "FileType",
                schema: "dbo",
                table: "ProjectIterations");

            migrationBuilder.DropColumn(
                name: "FileUrl",
                schema: "dbo",
                table: "ProjectIterations");
        }
    }
}
