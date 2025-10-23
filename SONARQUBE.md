# SonarQube Integration for Knotable

This project is integrated with SonarQube for comprehensive code quality analysis.

## 🔐 Environment Setup

### Required Environment Variables
Create a `.env.local` file in the project root with:
```bash
SONAR_TOKEN=your_sonarqube_token_here
```

**Security Note**: Never commit the actual token to version control. Use environment variables or secure secret management.

## 🚀 Quick Start

### Prerequisites
- Local SonarQube instance running on `http://localhost:9000`
- Node.js and npm installed
- SonarQube scanner installed globally: `npm install -g sonar-scanner`
- `SONAR_TOKEN` environment variable set

### Running Analysis

#### Option 1: Using npm scripts
```bash
# Run complete quality analysis
npm run quality:full

# Run only SonarQube analysis
npm run sonar:analyze

# Run SonarQube against local instance
npm run sonar:local
```

#### Option 2: Using scripts
```bash
# Linux/Mac
./scripts/sonar-analysis.sh

# Windows
scripts/sonar-analysis.bat
```

## 📊 Quality Metrics

The analysis covers:

- **Code Coverage**: Minimum 80% coverage required
- **Code Duplication**: Detects duplicate code blocks
- **Security Vulnerabilities**: Identifies security issues
- **Code Smells**: Highlights maintainability issues
- **Bugs**: Detects potential runtime errors
- **Technical Debt**: Measures code quality debt

## 🔧 Configuration

### Project Configuration
- `sonar-project.properties`: Main SonarQube configuration
- `sonar-quality-gate.properties`: Quality gate settings

### Excluded Files
- `node_modules/` - Dependencies
- `.next/` - Next.js build output
- `dist/`, `build/` - Build artifacts
- `coverage/` - Test coverage reports
- `prisma/` - Database schema files
- `public/` - Static assets
- `*.d.ts` - TypeScript declaration files

### Included Files
- `src/` - Source code
- `**/*.test.ts`, `**/*.test.tsx` - Test files
- `**/*.spec.ts`, `**/*.spec.tsx` - Specification files

## 🎯 Quality Gates

The project uses strict quality gates:

- **Maintainability Rating**: A (highest)
- **Reliability Rating**: A (highest)
- **Security Rating**: A (highest)
- **Code Coverage**: ≥80%
- **Duplicated Lines**: <3%
- **Technical Debt**: <5%

## 📈 Viewing Results

After running analysis, view results at:
- **Dashboard**: http://localhost:9000/dashboard?id=knotable
- **Issues**: http://localhost:9000/project/issues?id=knotable
- **Code Coverage**: http://localhost:9000/component_measures?id=knotable&metric=coverage

## 🛠️ Troubleshooting

### SonarQube Not Running
```bash
# Check if SonarQube is running
curl http://localhost:9000/api/system/status

# Start SonarQube (if using Docker)
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest
```

### Scanner Not Found
```bash
# Install SonarQube scanner globally
npm install -g sonar-scanner

# Or use npx
npx sonar-scanner
```

### Permission Issues
```bash
# Make scripts executable (Linux/Mac)
chmod +x scripts/sonar-analysis.sh
```

## 🔄 CI/CD Integration

For continuous integration, add to your CI pipeline:

```yaml
# GitHub Actions example
- name: SonarQube Analysis
  run: |
    npm run test:coverage
    npm run sonar:analyze
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

## 📚 Additional Resources

- [SonarQube Documentation](https://docs.sonarqube.org/)
- [SonarQube Scanner Documentation](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/)
- [Next.js SonarQube Integration](https://docs.sonarqube.org/latest/analysis/languages/javascript/)
