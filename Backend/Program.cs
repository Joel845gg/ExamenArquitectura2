using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DotNetEnv;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// --- Carga variables de entorno desde .env ---
DotNetEnv.Env.Load();

// --- Configuración de Servicios ---
// 1. Contexto de la base de datos (PostgreSQL con Supabase)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// 2. Configura CORS (Frontend-Backend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


// 3. Controladores y Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 4. Autenticación JWT (Supabase) - SIMPLIFICADA
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false; // Solo para desarrollo
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = false, // Simplificado para testing
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// --- Construye la App ---
var app = builder.Build();

// --- Inicialización de Base de Datos ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        // Asegurar que la base de datos se cree (si no existe)
        context.Database.EnsureCreated();

        // Ejecutar script SQL para asegurar la tabla Productos con la estructura correcta
        var sqlScript = @"
            CREATE EXTENSION IF NOT EXISTS ""uuid-ossp"";
            
            CREATE TABLE IF NOT EXISTS ""Productos"" (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                nombre VARCHAR(150) NOT NULL,
                precio_venta NUMERIC(10,2) NOT NULL,
                stock INT NOT NULL,
                categoria VARCHAR(100) NOT NULL,
                imagen_url TEXT,
                costo NUMERIC(10,2) NOT NULL,
                codigo_producto INT NOT NULL,
                codigo_visible VARCHAR(50) NOT NULL,
                marca VARCHAR(100),
                talla VARCHAR(20),
                color VARCHAR(50),
                genero VARCHAR(50)
            );
        ";
        context.Database.ExecuteSqlRaw(sqlScript);
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogInformation("Base de datos inicializada correctamente.");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocurrió un error al inicializar la base de datos.");
    }
}

//  HABILITAR ARCHIVOS ESTÁTICOS
app.UseDefaultFiles();   // Busca index.html automáticamente
app.UseStaticFiles();    // Permite servir wwwroot

// Middlewares
//if (app.Environment.IsDevelopment())
//{
    app.UseSwagger();
    app.UseSwaggerUI();
//}


/*
Cuidado,  siempre debe tener este orden:

UseHttpsRedirection()

UseCors() ← ¡ANTES de Authentication!

UseAuthentication() ← ¡ANTES de Authorization!

UseAuthorization()

MapControllers()
*/

app.UseRouting();
app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://0.0.0.0:{port}");


app.Run();