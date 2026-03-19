# 🚀 Aprendiendo JS + Playwright | Mi camino a QA Automation

![Playwright](https://img.shields.io/badge/Playwright-1.58.2-2C2C2C?style=flat&logo=playwright)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow)
![Status](https://img.shields.io/badge/Status-Learning%20%F0%9F%94%A5-brightgreen)

**Repo de aprendizaje** donde estoy pasando de **Python** (mi fuerte) a **JavaScript vanilla + Playwright** para convertirme en **Junior QA Automator**.

### 🎯 Objetivo
Dominar Playwright desde cero → Page Object Model → TypeScript → CI/CD para entrar a la compañía como QA.

---

### 📁 Estructura del proyecto

```bash
aprendiendoJS/
├── firststepsonJS/          # Primeros pasos vanilla (navigate, fill, SauceDemo básico)
├── learningPOMonJS/         # Nivel POM completo
│   ├── pages/
│   │   ├── basePage.ts
│   │   ├── loginPage.ts
│   │   ├── inventoryPage.ts
│   │   ├── cartPage.ts
│   │   ├── checkoutPage.ts
│   │   └── config.ts          # ← datos, credenciales, locators
│   └── tests/
│       ├── loginTest.spec.ts
│       ├── inventoryTest.spec.ts  ← describe + beforeEach
│       ├── cartTest.spec.ts
│       ├── checkoutTest.spec.ts
│       └── testE2E.spec.ts
├── playwright.config.ts     # Config pro (html report, video, trace, slowMo)
├── .gitignore               # Limpio y profesional
└── package.json
```

### Cómo correr los tests (en 10 segundos)
# 1. Clonar e instalar
git clone https://github.com/jerryfinol17/aprendiendoJS.git
cd aprendiendoJS
npm install

# 2. Correr TODO
npx playwright test

# 3. Correr solo un grupo
npx playwright test inventoryTest.spec.ts

# 4. Ver reporte bonito
npx playwright show-report


### Lo que ya logré (hace 3 semanas empecé de cero)
1. JS vanilla + async/await + ES modules  
2. Page Object Model completo (6 páginas + config centralizado)  
3. Tests con test.describe(), test.beforeEach(), test.fail() y datos externos  
4. Flujo E2E SauceDemo: Login → Inventory → Cart → Checkout (positivo y negativos)  
5. Evidencias automáticas: videos + screenshots on-failure + trace  
6. Configuración profesional de Playwright

###  Evidencias(pronto voy a subir GIFs y capturas aquí) 
1. Videos en carpeta videos/
2. Reporte HTML generado  
3. Screenshots de cada paso crítico

###  Roadmap

```bash
Migrar todo a TypeScript + fixtures custom
 ''En progreso''
 
GitHub Actions CI + Allure report
 ''Pendiente''

API testing + Visual testing + data-driven (CSV)
 ''Pendiente''


```
### ¿Querés ayudarme?
Críticas constructivas → bienvenidas  
Tips de senior → siempre acepto  
PRs para mejorar → sí por favor








