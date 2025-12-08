# Portfolio Website

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for R3F
- **GSAP** - Animation library
- **Tailwind CSS** - Utility-first CSS framework

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The website will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Hero.jsx          # Hero section with 3D background
│   ├── Hero3D.jsx        # 3D scene component
│   ├── About.jsx         # About section
│   ├── Portfolio.jsx    # Portfolio/projects section
│   ├── Skills.jsx       # Skills section
│   ├── Contact.jsx      # Contact form section
│   └── Navigation.jsx   # Navigation bar
├── App.jsx              # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Customization

### Update Personal Information

1. **Hero Section**: Edit `src/components/Hero.jsx` to change name, title, and description
2. **About Section**: Update `src/components/About.jsx` with your bio and skills
3. **Portfolio**: Modify the `projects` array in `src/components/Portfolio.jsx`
4. **Skills**: Update the `skills` array in `src/components/Skills.jsx`
5. **Contact**: Change contact information in `src/components/Contact.jsx`

### Colors & Styling

- Edit `tailwind.config.js` to customize the color scheme
- Modify `src/index.css` for global styles and effects

### 3D Elements

- Customize 3D geometries in `src/components/Hero3D.jsx`
- Adjust animations and positions as needed

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available for personal and commercial use.
