---
title: 前端组件库面试题收集
date: 2025-06-19 10:24:04
permalink: false
article: false
categories:
  - null
tags:
  - null
---

# 前端组件库面试题收集

## 基础理论部分

### 组件库的定义与价值

**什么是前端组件库？它解决了什么问题？**

前端组件库是一套预先构建的、可复用的UI组件集合，它们遵循统一的设计规范和技术标准。组件库主要解决以下问题：

1. **代码复用性**：避免重复开发相似的UI组件
2. **一致性保障**：确保产品界面的视觉和交互一致性
3. **开发效率**：提高团队开发速度，降低维护成本
4. **质量保证**：通过统一测试和优化，提供高质量的组件
5. **协作效率**：设计师和开发者基于统一标准协作

**组件库与UI框架的区别是什么？**

- **组件库**：专注于提供可复用的UI组件，如Button、Input、Modal等
- **UI框架**：提供完整的应用开发解决方案，包括路由、状态管理、构建工具等
- **设计系统**：更广泛的概念，包含设计原则、组件库、使用指南等

### 组件库架构设计

**如何设计一个可扩展的组件库架构？**

```typescript
// 1. 分层架构设计
src/
├── components/          # 组件层
│   ├── basic/          # 基础组件（Button、Input等）
│   ├── layout/         # 布局组件（Grid、Container等）
│   ├── feedback/       # 反馈组件（Message、Modal等）
│   └── navigation/     # 导航组件（Menu、Breadcrumb等）
├── hooks/              # 自定义Hooks
├── utils/              # 工具函数
├── styles/             # 样式系统
│   ├── tokens/         # 设计令牌
│   ├── mixins/         # 样式混入
│   └── themes/         # 主题配置
├── types/              # TypeScript类型定义
└── index.ts            # 统一导出

// 2. 组件基类设计
interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  testId?: string;
}

// 3. 主题系统设计
interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
  };
}
```

**组件库的依赖管理策略是什么？**

1. **Peer Dependencies**：将React、ReactDOM等作为peerDependencies
2. **最小化依赖**：避免引入过多第三方库，减少bundle大小
3. **版本兼容性**：明确支持的React版本范围
4. **Tree Shaking支持**：确保组件库支持按需引入

```json
{
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "dependencies": {
    "classnames": "^2.3.1",
    "@babel/runtime": "^7.0.0"
  }
}
```

## 技术实现部分

### 样式隔离与主题系统

**如何实现组件库的样式隔离？**

1. **CSS Modules方案**：
```scss
// Button.module.scss
.button {
  padding: 8px 16px;
  border-radius: 4px;
  
  &.primary {
    background-color: var(--color-primary);
    color: white;
  }
  
  &.secondary {
    background-color: transparent;
    border: 1px solid var(--color-primary);
  }
}
```

2. **CSS-in-JS方案**：
```typescript
import styled from 'styled-components';

const StyledButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 4px;
  background-color: ${props => 
    props.variant === 'primary' 
      ? props.theme.colors.primary 
      : 'transparent'
  };
`;
```

3. **BEM + CSS变量方案**：
```scss
.ui-button {
  --button-padding: 8px 16px;
  --button-border-radius: 4px;
  
  padding: var(--button-padding);
  border-radius: var(--button-border-radius);
  
  &--primary {
    background-color: var(--color-primary);
  }
}
```

**如何设计灵活的主题系统？**

```typescript
// 1. 设计令牌系统
const designTokens = {
  colors: {
    primary: {
      50: '#f0f9ff',
      500: '#3b82f6',
      900: '#1e3a8a'
    }
  },
  spacing: {
    1: '4px',
    2: '8px',
    4: '16px'
  }
};

// 2. 主题切换实现
const ThemeProvider: React.FC<{ theme: ThemeConfig }> = ({ theme, children }) => {
  useEffect(() => {
    // 动态设置CSS变量
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  }, [theme]);
  
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

// 3. 暗色模式支持
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return { isDark, setIsDark };
};
```

### TypeScript支持

**如何为组件库提供完善的TypeScript支持？**

```typescript
// 1. 严格的类型定义
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

// 2. 泛型组件支持
interface SelectProps<T = any> {
  value?: T;
  onChange?: (value: T) => void;
  options: Array<{
    label: string;
    value: T;
  }>;
}

function Select<T>({ value, onChange, options }: SelectProps<T>) {
  // 实现
}

// 3. 类型导出
export type { ButtonProps, SelectProps };
export { Button, Select };

// 4. 声明文件生成
// tsconfig.json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist"
  }
}
```

### 组件通信与状态管理

**复合组件如何设计？**

```typescript
// 1. Context模式实现复合组件
const TabsContext = React.createContext<{
  activeKey: string;
  onChange: (key: string) => void;
}>({} as any);

const Tabs: React.FC<{ activeKey: string; onChange: (key: string) => void }> & {
  TabPane: typeof TabPane;
} = ({ activeKey, onChange, children }) => {
  return (
    <TabsContext.Provider value={{ activeKey, onChange }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
};

const TabPane: React.FC<{ key: string; tab: string }> = ({ key, tab, children }) => {
  const { activeKey } = useContext(TabsContext);
  return activeKey === key ? <div>{children}</div> : null;
};

Tabs.TabPane = TabPane;

// 使用方式
<Tabs activeKey="1" onChange={setActiveKey}>
  <Tabs.TabPane key="1" tab="Tab 1">Content 1</Tabs.TabPane>
  <Tabs.TabPane key="2" tab="Tab 2">Content 2</Tabs.TabPane>
</Tabs>
```

## 工程化部分

### 构建与打包

**组件库的构建策略是什么？**

```javascript
// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'UILibrary',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM'
      }
    }
  ],
  external: ['react', 'react-dom'],
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.build.json'
    }),
    postcss({
      extract: true,
      minimize: true
    }),
    terser()
  ]
};
```

**如何实现按需加载？**

```typescript
// 1. 目录结构支持按需加载
src/
├── button/
│   ├── index.ts
│   ├── Button.tsx
│   └── style/
│       └── index.scss
├── input/
│   ├── index.ts
│   ├── Input.tsx
│   └── style/
│       └── index.scss

// 2. babel-plugin-import配置
{
  "plugins": [
    [
      "import",
      {
        "libraryName": "my-ui-lib",
        "libraryDirectory": "es",
        "style": true
      }
    ]
  ]
}

// 3. 使用方式
import { Button } from 'my-ui-lib'; // 只加载Button组件

// 4. 手动按需加载
import Button from 'my-ui-lib/es/button';
import 'my-ui-lib/es/button/style';
```

### 版本管理与发布

**组件库的版本管理策略？**

1. **语义化版本控制**：
   - **MAJOR**：不兼容的API修改
   - **MINOR**：向后兼容的功能性新增
   - **PATCH**：向后兼容的问题修正

2. **变更日志管理**：
```markdown
# Changelog

## [2.1.0] - 2024-12-19

### Added
- 新增 DatePicker 组件
- Button 组件支持 loading 状态

### Changed
- 优化 Modal 组件动画效果

### Fixed
- 修复 Input 组件在 Safari 下的样式问题

### Breaking Changes
- Table 组件的 `dataSource` 属性重命名为 `data`
```

3. **自动化发布流程**：
```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Publish to NPM
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 测试策略

**组件库的测试策略是什么？**

```typescript
// 1. 单元测试
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('should render correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  
  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('should apply correct styles for variants', () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('button--primary');
  });
});

// 2. 视觉回归测试
import { chromatic } from '@chromatic-com/storybook';

export default {
  title: 'Components/Button',
  component: Button,
  parameters: {
    chromatic: { disableSnapshot: false }
  }
};

// 3. 可访问性测试
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should not have accessibility violations', async () => {
  const { container } = render(<Button>Accessible button</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 性能优化部分

### Bundle大小优化

**如何优化组件库的Bundle大小？**

1. **Tree Shaking支持**：
```typescript
// 确保使用ES模块导出
export { Button } from './button';
export { Input } from './input';
export { Modal } from './modal';

// 避免使用export * from
// ❌ export * from './components';
// ✅ 明确导出每个组件
```

2. **代码分割**：
```typescript
// 大型组件使用动态导入
const DatePicker = React.lazy(() => import('./DatePicker'));

const MyComponent = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DatePicker />
    </Suspense>
  );
};
```

3. **依赖优化**：
```javascript
// webpack.config.js
module.exports = {
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
    lodash: 'lodash' // 让用户自己引入
  },
  optimization: {
    sideEffects: false // 支持Tree Shaking
  }
};
```

### 运行时性能优化

**如何优化组件的运行时性能？**

```typescript
// 1. 使用React.memo避免不必要的重渲染
const Button = React.memo<ButtonProps>(({ children, onClick, variant = 'primary' }) => {
  return (
    <button 
      className={`button button--${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
});

// 2. 使用useMemo缓存计算结果
const Table = ({ data, columns }) => {
  const sortedData = useMemo(() => {
    return data.sort((a, b) => a.id - b.id);
  }, [data]);
  
  const renderedColumns = useMemo(() => {
    return columns.map(col => ({
      ...col,
      render: col.render || ((value) => value)
    }));
  }, [columns]);
  
  return (
    <table>
      {/* 渲染逻辑 */}
    </table>
  );
};

// 3. 虚拟滚动优化长列表
const VirtualList = ({ items, itemHeight = 50 }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerHeight = 400;
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  
  return (
    <div 
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.target.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={visibleStart + index}
            style={{
              position: 'absolute',
              top: (visibleStart + index) * itemHeight,
              height: itemHeight
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 样式性能优化

**如何优化组件库的样式性能？**

```scss
// 1. 使用CSS变量减少重复计算
:root {
  --primary-color: #1890ff;
  --border-radius: 4px;
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.button {
  background-color: var(--primary-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

// 2. 避免深层嵌套选择器
// ❌ 性能差
.ui-table .ui-table-body .ui-table-row .ui-table-cell .ui-button {
  margin: 4px;
}

// ✅ 性能好
.ui-table-cell-button {
  margin: 4px;
}

// 3. 使用transform和opacity进行动画
.modal {
  transition: opacity 0.3s ease, transform 0.3s ease;
  
  &.modal--hidden {
    opacity: 0;
    transform: scale(0.9);
  }
  
  &.modal--visible {
    opacity: 1;
    transform: scale(1);
  }
}
```

## 生产实践部分

### 兼容性处理

**如何处理浏览器兼容性问题？**

```javascript
// 1. Babel配置
// .babelrc
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
        },
        "useBuiltIns": "usage",
        "corejs": 3
      }
    ],
    "@babel/preset-react",
    "@babel/preset-typescript"
  ]
}

// 2. PostCSS配置
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer')({
      browsers: ['> 1%', 'last 2 versions']
    }),
    require('postcss-preset-env')({
      stage: 3,
      features: {
        'custom-properties': false
      }
    })
  ]
};

// 3. Polyfill处理
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// 4. 特性检测
const supportsIntersectionObserver = 'IntersectionObserver' in window;

if (!supportsIntersectionObserver) {
  // 降级方案或polyfill
  import('intersection-observer');
}
```

### 国际化支持

**如何为组件库添加国际化支持？**

```typescript
// 1. 国际化Context设计
interface LocaleContextType {
  locale: string;
  messages: Record<string, string>;
}

const LocaleContext = React.createContext<LocaleContextType>({
  locale: 'en',
  messages: {}
});

// 2. 多语言资源管理
const locales = {
  en: {
    'button.loading': 'Loading...',
    'modal.confirm': 'Confirm',
    'modal.cancel': 'Cancel',
    'datepicker.placeholder': 'Select date'
  },
  zh: {
    'button.loading': '加载中...',
    'modal.confirm': '确认',
    'modal.cancel': '取消',
    'datepicker.placeholder': '选择日期'
  }
};

// 3. 国际化Hook
const useLocale = () => {
  const { locale, messages } = useContext(LocaleContext);
  
  const t = useCallback((key: string, params?: Record<string, any>) => {
    let message = messages[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        message = message.replace(`{${param}}`, value);
      });
    }
    
    return message;
  }, [messages]);
  
  return { locale, t };
};

// 4. 组件中使用
const Button: React.FC<ButtonProps> = ({ loading, children, ...props }) => {
  const { t } = useLocale();
  
  return (
    <button {...props}>
      {loading ? t('button.loading') : children}
    </button>
  );
};
```

### 可访问性(A11y)

**如何确保组件库的可访问性？**

```typescript
// 1. 语义化HTML结构
const Modal: React.FC<ModalProps> = ({ visible, title, children, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // 焦点管理
  useEffect(() => {
    if (visible) {
      modalRef.current?.focus();
    }
  }, [visible]);
  
  // 键盘事件处理
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose?.();
    }
  };
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <h2 id="modal-title">{title}</h2>
      <div role="document">{children}</div>
      <button 
        aria-label="Close modal"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
};

// 2. 颜色对比度检查
const checkColorContrast = (foreground: string, background: string) => {
  // WCAG AA标准要求对比度至少为4.5:1
  const contrast = calculateContrast(foreground, background);
  return contrast >= 4.5;
};

// 3. 键盘导航支持
const Menu: React.FC<MenuProps> = ({ items }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        items[focusedIndex]?.onClick?.();
        break;
    }
  };
  
  return (
    <ul role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li
          key={item.key}
          role="menuitem"
          tabIndex={index === focusedIndex ? 0 : -1}
          aria-selected={index === focusedIndex}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
};
```

## 高级特性部分

### 插件系统设计

**如何设计组件库的插件系统？**

```typescript
// 1. 插件接口定义
interface Plugin {
  name: string;
  version: string;
  install: (app: ComponentLibrary) => void;
  uninstall?: (app: ComponentLibrary) => void;
}

// 2. 组件库核心类
class ComponentLibrary {
  private plugins: Map<string, Plugin> = new Map();
  private components: Map<string, React.ComponentType> = new Map();
  
  use(plugin: Plugin) {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already installed`);
      return this;
    }
    
    this.plugins.set(plugin.name, plugin);
    plugin.install(this);
    return this;
  }
  
  component(name: string, component: React.ComponentType) {
    this.components.set(name, component);
  }
  
  getComponent(name: string) {
    return this.components.get(name);
  }
}

// 3. 插件示例
const IconPlugin: Plugin = {
  name: 'icon',
  version: '1.0.0',
  install(app) {
    // 注册图标组件
    app.component('Icon', Icon);
    
    // 扩展现有组件
    const originalButton = app.getComponent('Button');
    if (originalButton) {
      const ButtonWithIcon = (props: any) => {
        const { icon, ...restProps } = props;
        return (
          <originalButton {...restProps}>
            {icon && <Icon name={icon} />}
            {props.children}
          </originalButton>
        );
      };
      app.component('Button', ButtonWithIcon);
    }
  }
};

// 4. 使用方式
const app = new ComponentLibrary();
app.use(IconPlugin);
```

### 表单系统设计

**如何设计复杂的表单系统？**

```typescript
// 1. 表单状态管理
interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

const useForm = <T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit
}: {
  initialValues: T;
  validationSchema?: any;
  onSubmit: (values: T) => Promise<void> | void;
}) => {
  const [state, setState] = useState<FormState>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false
  });
  
  const setFieldValue = (name: string, value: any) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, [name]: value }
    }));
  };
  
  const setFieldError = (name: string, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error }
    }));
  };
  
  const validateField = async (name: string, value: any) => {
    if (validationSchema) {
      try {
        await validationSchema.validateAt(name, { [name]: value });
        setFieldError(name, '');
      } catch (error) {
        setFieldError(name, error.message);
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      await onSubmit(state.values as T);
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };
  
  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    setFieldValue,
    setFieldError,
    validateField,
    handleSubmit
  };
};

// 2. 表单项组件
const FormItem: React.FC<{
  name: string;
  label: string;
  required?: boolean;
  children: React.ReactElement;
}> = ({ name, label, required, children }) => {
  const form = useContext(FormContext);
  const error = form.errors[name];
  const touched = form.touched[name];
  
  const childWithProps = React.cloneElement(children, {
    value: form.values[name],
    onChange: (value: any) => {
      form.setFieldValue(name, value);
      form.validateField(name, value);
    },
    onBlur: () => {
      form.setFieldTouched(name, true);
    }
  });
  
  return (
    <div className="form-item">
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      {childWithProps}
      {touched && error && (
        <div className="form-error">{error}</div>
      )}
    </div>
  );
};
```

## 问题排查部分

### 常见性能问题

**组件库常见的性能瓶颈有哪些？如何排查？**

1. **重复渲染问题**：
```typescript
// 问题：父组件每次渲染都创建新的对象/函数
const Parent = () => {
  const [count, setCount] = useState(0);
  
  // ❌ 每次渲染都创建新的对象
  const config = { theme: 'dark', size: 'large' };
  const handleClick = () => console.log('clicked');
  
  return <Child config={config} onClick={handleClick} />;
};

// 解决方案：使用useMemo和useCallback
const Parent = () => {
  const [count, setCount] = useState(0);
  
  // ✅ 缓存对象和函数
  const config = useMemo(() => ({ theme: 'dark', size: 'large' }), []);
  const handleClick = useCallback(() => console.log('clicked'), []);
  
  return <Child config={config} onClick={handleClick} />;
};
```

2. **大列表渲染问题**：
```typescript
// 使用React DevTools Profiler排查
// 实现虚拟滚动或分页加载
const LargeList = ({ items }) => {
  const [visibleItems, setVisibleItems] = useState(items.slice(0, 50));
  
  const loadMore = useCallback(() => {
    setVisibleItems(prev => [
      ...prev,
      ...items.slice(prev.length, prev.length + 50)
    ]);
  }, [items]);
  
  return (
    <InfiniteScroll onLoadMore={loadMore}>
      {visibleItems.map(item => <Item key={item.id} data={item} />)}
    </InfiniteScroll>
  );
};
```

### 样式冲突问题

**如何排查和解决样式冲突？**

```typescript
// 1. 使用CSS-in-JS避免全局污染
const Button = styled.button`
  /* 样式被封装在组件内部 */
  padding: 8px 16px;
  background: ${props => props.theme.primary};
`;

// 2. 使用CSS Modules
// Button.module.css
.button {
  padding: 8px 16px;
}

// Button.tsx
import styles from './Button.module.css';
const Button = () => <button className={styles.button}>Click</button>;

// 3. 使用命名空间前缀
.ui-lib-button {
  padding: 8px 16px;
}

// 4. 提供样式重置选项
const resetStyles = `
  .ui-lib-reset {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
`;
```

### 类型错误排查

**TypeScript相关问题如何排查？**

```typescript
// 1. 泛型约束问题
interface SelectProps<T extends string | number = string> {
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}

// 2. 条件类型处理
type ButtonProps<T extends 'button' | 'link' = 'button'> = T extends 'link'
  ? React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
  : React.ButtonHTMLAttributes<HTMLButtonElement>;

// 3. 类型导出问题
// 确保所有公共类型都被导出
export type { ButtonProps, SelectProps, ModalProps };

// 4. 版本兼容性
// package.json
{
  "peerDependencies": {
    "@types/react": ">=16.8.0",
    "typescript": ">=4.0.0"
  }
}
```

## 总结

这份面试题涵盖了前端组件库开发的核心知识点：

1. **理论基础**：组件库的定义、价值和架构设计
2. **技术实现**：样式隔离、TypeScript支持、组件通信
3. **工程化**：构建打包、版本管理、测试策略
4. **性能优化**：Bundle优化、运行时性能、样式性能
5. **生产实践**：兼容性、国际化、可访问性
6. **高级特性**：插件系统、表单系统
7. **问题排查**：性能问题、样式冲突、类型错误

这些问题和答案基于真实的生产环境经验，涵盖了从基础概念到高级实践的各个层面，能够全面考察候选人的组件库开发能力。
