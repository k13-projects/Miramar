# Miramar Food Hall Website

Official website for Miramar Food Hall — San Clemente's newest culinary destination located in the historic Miramar Theatre.

![Miramar Food Hall](website/images/logo/logo.png)

## About

Miramar Food Hall is a vibrant culinary destination housed in a restored 1938 Spanish Colonial Revival landmark in San Clemente, California. Once home to the Miramar Theatre and San Clemente Bowling Center, the space has been transformed into a modern food hall celebrating global flavors and local community.

**Tagline:** *Global Bites, Local Vibes*

## Live Website

Visit the live site: [Miramar Food Hall](https://k13-projects.github.io/Miramar/)

[![Deploy to GitHub Pages](https://github.com/k13-projects/Miramar/actions/workflows/deploy.yml/badge.svg)](https://github.com/k13-projects/Miramar/actions/workflows/deploy.yml)

## Features

- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Modern UI/UX** - Clean, contemporary design with smooth animations
- **Brand Consistent** - Follows official brand guidelines (colors, typography)
- **Accessible** - Semantic HTML structure with ARIA labels
- **Performance Optimized** - Efficient CSS and JavaScript

## Sections

| Section | Description |
|---------|-------------|
| Hero | Full-screen landing with tagline and wave animation |
| About/Story | Timeline of the venue's history from 1938 to 2026 |
| Vendors | Grid showcase of all 13 food vendors with details |
| Location | Address, operating hours, and Google Maps integration |
| Events | Upcoming public events calendar |
| Bookings | Private event inquiry form for groups of 15+ |
| Contact | Contact information and booking form |
| Instagram | Social media feed integration |

## Vendors

Miramar Food Hall features 13 unique food vendors:

1. **Cosmos Burger** - Premium burgers
2. **El Puerto Street Tacos** - Authentic Mexican
3. **Graciously Thai** - Home-style Thai cuisine
4. **Hen Haus** - Nashville hot chicken
5. **Immersion Coffee Co.** - Specialty coffee
6. **It's Allll Rice** - Global fried rice
7. **La Vida** - Healthy eats
8. **Lobster Lab** - Seafood & lobster rolls
9. **MOTO Pizza** - Detroit/NY/Roman style pizza
10. **Norigiri** - Japanese onigiri
11. **RolledUp SC** - Sushi rolls & bowls
12. **Sidelines Sandwiches** - Gourmet sandwiches
13. **The Pita** - Middle Eastern cuisine

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Flexbox, Grid, animations
- **JavaScript** - Vanilla JS for interactions
- **Google Fonts** - Josefin Sans typography
- **Google Maps** - Embedded location map

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Dark Teal | `#046054` | Primary brand color, headings |
| Teal | `#169080` | Buttons, accents, links |
| Orange | `#A94d00` | Accent highlights |
| Cream | `#f6f4ed` | Background sections |

## Project Structure

```
Miramar/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions CI/CD
├── website/
│   ├── index.html          # Main HTML file
│   ├── css/
│   │   └── styles.css      # Main stylesheet
│   ├── js/
│   │   └── main.js         # JavaScript interactions
│   └── images/
│       ├── logo/           # Brand logo assets
│       ├── story/          # Historical images
│       └── vendors/        # Vendor photos
├── Miramar Assets/         # Source design assets (not tracked)
├── README.md               # This file
├── LICENSE                 # MIT License
└── .gitignore              # Git ignore rules
```

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/k13-projects/Miramar.git
   ```

2. Navigate to the website directory:
   ```bash
   cd Miramar/website
   ```

3. Open `index.html` in your browser, or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve
   ```

4. Visit `http://localhost:8000`

## Deployment

This site uses **GitHub Actions** for automatic deployment to GitHub Pages.

### Automatic Deployment (CI/CD)

Every push to the `main` branch automatically triggers a deployment:

1. GitHub Actions workflow runs (`.github/workflows/deploy.yml`)
2. Website files from `/website` folder are built and uploaded
3. Site is deployed to GitHub Pages
4. Live at: https://k13-projects.github.io/Miramar/

### Manual Setup (First Time Only)

1. Go to repository **Settings** > **Pages**
2. Under "Build and deployment", select **Source: GitHub Actions**
3. The workflow will handle the rest automatically

### Workflow Features

- Triggers on every push to `main`
- Can be manually triggered from Actions tab
- Concurrent deployment protection
- Automatic artifact upload and deployment

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

## Contact

**Miramar Food Hall**
1720 North El Camino Real
San Clemente, CA 92672

- Website: [miramarfoodhall.com](https://miramarfoodhall.com)
- Instagram: [@miramarfoodhall](https://instagram.com/miramarfoodhall)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built with care for the San Clemente community*
