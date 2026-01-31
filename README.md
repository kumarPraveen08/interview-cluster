# Interview Cluster

A powerful, interactive visualization tool for managing and exploring LeetCode interview questions organized by company. Built with Next.js, React, TypeScript, and D3.js.

## 📋 Description

Interview Cluster helps you organize, visualize, and track your LeetCode interview preparation journey. Import questions from popular tech companies, visualize relationships in an interactive graph, filter by difficulty and company, and export your data in multiple formats. Perfect for interview preparation and tracking your progress across different companies.

## ✨ Features

- **📊 Interactive Graph Visualization**: Explore questions in a force-directed or semantic graph layout using D3.js
- **📝 List View**: Browse questions in a detailed table with sorting and filtering
- **🏢 Company-Based Organization**: Import and organize questions by company (Netflix, Google, Amazon, etc.)
- **⭐ Favorites & Completed Tracking**: Mark questions as favorites or completed for easy tracking
- **🔍 Advanced Filtering**: Filter by company, difficulty level, and search by title
- **📥 Multiple Import Options**: 
  - Import from GitHub repository (preset companies)
  - Manual CSV import with flexible format
- **📤 Data Export**: Export your library, favorites, or completed lists as JSON, TXT, or CSV
- **🌓 Dark Mode**: Beautiful dark/light theme toggle
- **💾 Local Storage**: All data persists locally in your browser
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: D3.js
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kumarPraveen08/interview-cluster.git
cd interview-cluster
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Importing Questions

1. **From GitHub**: Click the import button and select from preset companies (Netflix, Google, Amazon, etc.)
2. **Manual Import**: Use the manual import feature to add custom CSV data
   - Format: `Title,URL,Difficulty,Acceptance,Frequency`
   - ID is optional (auto-generated if missing)
   - Only Title is required

### Features Overview

- **Graph View**: Visualize questions in an interactive D3.js graph with zoom, pan, and node selection
- **List View**: Browse questions in a sortable table with infinite scroll
- **Filtering**: Filter by company, difficulty, and search by title
- **Tracking**: Mark questions as favorites or completed
- **Export**: Export your data in JSON, TXT, or CSV format

## 🛠️ Building for Production

```bash
npm run build
npm start
```

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 🙏 Acknowledgments

- LeetCode question data sourced from [snehasishroy/leetcode-companywise-interview-questions](https://github.com/snehasishroy/leetcode-companywise-interview-questions)
