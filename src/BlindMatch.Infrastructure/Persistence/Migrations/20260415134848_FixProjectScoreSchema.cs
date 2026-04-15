using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlindMatch.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixProjectScoreSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsRatified",
                schema: "dbo",
                table: "ProjectScores");

            migrationBuilder.DropColumn(
                name: "Presentation",
                schema: "dbo",
                table: "ProjectScores");

            migrationBuilder.DropColumn(
                name: "RatifiedAt",
                schema: "dbo",
                table: "ProjectScores");

            migrationBuilder.DropColumn(
                name: "ReportClarity",
                schema: "dbo",
                table: "ProjectScores");

            migrationBuilder.DropColumn(
                name: "ResearchQuality",
                schema: "dbo",
                table: "ProjectScores");

            migrationBuilder.RenameColumn(
                name: "TechnicalImpl",
                schema: "dbo",
                table: "ProjectScores",
                newName: "OverallScore");

            migrationBuilder.AddColumn<DateTime>(
                name: "GradedAt",
                schema: "dbo",
                table: "ProjectScores",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GradedAt",
                schema: "dbo",
                table: "ProjectScores");

            migrationBuilder.RenameColumn(
                name: "OverallScore",
                schema: "dbo",
                table: "ProjectScores",
                newName: "TechnicalImpl");

            migrationBuilder.AddColumn<bool>(
                name: "IsRatified",
                schema: "dbo",
                table: "ProjectScores",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Presentation",
                schema: "dbo",
                table: "ProjectScores",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "RatifiedAt",
                schema: "dbo",
                table: "ProjectScores",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReportClarity",
                schema: "dbo",
                table: "ProjectScores",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ResearchQuality",
                schema: "dbo",
                table: "ProjectScores",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
