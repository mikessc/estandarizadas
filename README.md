# Práctica Pruebas Nacionales Estandarizadas (MEP)

App web para que alumnos de primaria practiquen las pruebas sumativas del MEP. Next.js 16 + Prisma + Postgres (Neon), lista para Vercel.

Requisitos: Node.js 20 o superior.

- **Admin**: crea profesores y alumnos, liga alumnos a profesores, restablece contraseñas y ve todos los reportes (`/admin`).
- **Profesor**: crea alumnos (quedan ligados a él) y ve los intentos de sus alumnos (`/profesor`).
- **Alumno**: resuelve exámenes y ve su reporte e historial (`/alumno`).

Las respuestas correctas nunca llegan al navegador antes de entregar: la calificación se hace en el servidor.

## Despliegue en Vercel

1. **Sube el repositorio** a GitHub e impórtalo en Vercel (New Project).
2. **Crea la base de datos Neon desde el Marketplace**: en el proyecto de Vercel, *Storage → Create Database → Neon (Serverless Postgres)* y conéctala al proyecto. Usa el prefijo `STORAGE` para que agregue automáticamente `STORAGE_DATABASE_URL` (con pooler) y `STORAGE_DATABASE_URL_UNPOOLED` (directa, la usa Prisma para migrar).
3. **Configura las variables de entorno** en *Settings → Environment Variables*:

   | Variable | Valor |
   |---|---|
   | `STORAGE_DATABASE_URL` | La agrega Neon |
   | `STORAGE_DATABASE_URL_UNPOOLED` | La agrega Neon |
   | `AUTH_SECRET` | Cadena larga y aleatoria. Genérala con `openssl rand -base64 32` |
   | `ADMIN_EMAIL` | Correo del administrador |
   | `ADMIN_PASSWORD` | Contraseña inicial del administrador |

4. Haz **Redeploy** en Vercel. El build (`npm run build`) ejecuta `prisma migrate deploy`, así que las tablas se crean y actualizan solas en cada deploy.

5. **Crea el usuario admin** desde tu computadora (una sola vez, después del primer deploy):

   ```bash
   npm install
   npx vercel env pull .env.local --environment=production
   npm run seed                    # crea o actualiza el admin con ADMIN_EMAIL / ADMIN_PASSWORD
   ```

   `npm run seed` y `npm run db:migrate` leen `.env.local`. Si en Vercel las variables son *Sensitive*, `vercel env pull` escribe `"[Sensitive]"` en vez del valor: reemplaza a mano en `.env.local` `STORAGE_DATABASE_URL` y `STORAGE_DATABASE_URL_UNPOOLED` (desde la consola de Neon, *Connection string*), `ADMIN_EMAIL` y `ADMIN_PASSWORD`.

   Luego entra con el correo del admin.

> Volver a correr `npm run seed` restablece la contraseña del admin al valor de `ADMIN_PASSWORD`.

## Desarrollo local

```bash
cp .env.example .env.local   # llena los valores
npm install
npm run db:migrate
npm run seed
npm run dev            # http://localhost:3000
npm run check          # prueba de la lógica de calificación
```

## Agregar o cambiar exámenes

Los exámenes se leen automáticamente de `data/exams/*.json`; no hay panel de edición. Para agregar uno:

1. Crea `data/exams/<id>.json` (el nombre del archivo puede ser cualquiera; se usa el `id` de adentro).
2. Pon sus imágenes en `public/exams/<id>/`.
3. Haz commit y push; Vercel lo publica en el siguiente deploy.

Formato:

```json
{
  "id": "matematicas-primaria",
  "title": "Matemáticas – Práctica",
  "subject": "Matemáticas",
  "questions": [
    {
      "id": "q1",
      "number": 1,
      "block": "Números",
      "blockNumber": 1,
      "skill": "Reconoce las distintas representaciones de números naturales…",
      "text": "Considere la siguiente tabla:\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n![Figura](/exams/matematicas-primaria/q1.png)\n\n¿Cuánto es $\\dfrac{3}{2}$?",
      "options": { "A": "texto", "B": "$\\frac{3}{2}$", "C": "● y ○", "D": { "text": "opcional", "image": "/exams/matematicas-primaria/q1d.png" } },
      "answer": "B"
    }
  ]
}
```

- `text` y las opciones son Markdown: tablas GFM, listas, **negrita**, _cursiva_, fórmulas `$…$` / `$$…$$` y subrayado con `<u>…</u>` (es la única etiqueta HTML permitida; cualquier otra se muestra como texto).
- Los párrafos se separan con una línea en blanco (`\n\n`). Un solo `\n` no crea párrafo nuevo.
- Las imágenes van dentro del Markdown con `![descripción](/exams/<id>/archivo.png)`; se ajustan al ancho de la pantalla y se amplían al tocarlas. También se aceptan los campos opcionales `"images": [...]` y `"source": "Tomado de: …"`.
- Una opción puede ser un texto o un objeto `{ "text"?: "...", "image": "/exams/..." }`.
- `id` de cada pregunta debe ser único dentro del examen y no debe cambiar después de publicado: los intentos guardados se califican contra él.
- `answer` es `"A"`, `"B"`, `"C"` o `"D"`.
