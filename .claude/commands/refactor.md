# 🏗️ SAFE REFACTORING ORCHESTRATION PROTOCOL

**Core Philosophy: IMPROVE CODE WITHOUT BREAKING ANYTHING**

You are working on the current project. The user has requested to refactor specific files tagged with @ symbols in their arguments: "$ARGUMENTS"

## 🎯 PRIMARY DIRECTIVE: SAFETY FIRST

**Your mission is to improve code quality while maintaining 100% functionality.**

### Non-Negotiable Safety Rules:

1. ✅ **Preserve ALL existing functionality** - Zero breaking changes allowed
2. ✅ **Maintain type safety** - All TypeScript types must remain intact
3. ✅ **Verify imports** - Every import must resolve correctly after refactoring
4. ✅ **Follow project patterns** - Use existing conventions, don't invent new ones
5. ✅ **Test compatibility** - Ensure all consuming code continues to work
6. ✅ **Incremental validation** - Check each step before proceeding

### Risk Mitigation Framework:

- **Before touching code**: Understand ALL dependencies and usage patterns
- **During refactoring**: Preserve exact behavior, only improve structure
- **After changes**: Validate that nothing broke (imports, types, functionality)

---

## 📋 AUTO-LOADED PROJECT CONTEXT

These files provide critical context for safe refactoring:

- @/CLAUDE.md - Project standards, patterns, and best practices
- @/docs/ai-context/project-structure.md - Architecture and organization
- @/docs/ai-context/docs-overview.md - Documentation patterns

**CRITICAL**: Always consult these before making structural decisions.

---

## 🔍 STEP 1: PARSE TAGGED FILES

Extract all @ tagged file paths from the user's arguments. **Only process files explicitly tagged with @ symbols.**

### Parsing Rules:

- ✅ **Extract**: Files with @ prefix (e.g., `@src/big-file.ts`)
- ❌ **Ignore**: Non-tagged text, descriptions, or instructions
- ⚠️ **Validate**: Check each path exists before proceeding

**Example:**

```
Input: "refactor @src/components/LargeComponent.tsx it's too big"
Extract: ["src/components/LargeComponent.tsx"]
```

---

## 🔎 STEP 2: VALIDATE AND DEEP ANALYSIS

For each tagged file, perform comprehensive pre-refactoring analysis:

### 2.1 File Existence Validation

```
□ Verify file exists at exact path
□ If missing: Report to user and skip
□ If exists: Proceed to analysis
```

### 2.2 Complete File Understanding

```
□ Read entire file contents
□ Identify all exports (functions, types, constants)
□ Map internal dependencies and structure
□ Note any special patterns or conventions used
□ Identify complexity hotspots
```

### 2.3 Dependency Network Discovery

```
□ Find ALL files that import from this file
□ Identify external dependencies this file uses
□ Map the complete dependency graph
□ Check for circular dependencies
□ Note any global state or side effects
```

### 2.4 Project Context Analysis

```
□ Review surrounding directory structure
□ Identify similar files and their organization
□ Understand naming conventions in this area
□ Check for existing test files
□ Review related documentation
```

---

## 🧠 STEP 3: INTELLIGENT STRATEGY DECISION

**Think deeply before acting.** Choose the safest and most effective approach based on complexity and risk level.

### Strategy Selection Matrix:

#### ✅ DIRECT REFACTORING (0-1 sub-agents)

**When to use:**

- File is straightforward with obvious split points
- Minimal external dependencies (<5 importing files)
- Standard patterns (extract utils, split UI/logic)
- Low risk of breaking changes
- Well-isolated functionality

**Example:** Utility file with independent helper functions

---

#### ⚙️ FOCUSED ANALYSIS (2-3 sub-agents)

**When to use:**

- Moderate complexity with specific concerns
- Medium dependency footprint (5-15 importing files)
- One aspect needs deep investigation (dependencies OR structure)
- Some risk of breaking changes
- Requires careful import management

**Example:** Component with business logic and multiple consumers

---

#### 🔬 COMPREHENSIVE ANALYSIS (4+ sub-agents)

**When to use:**

- High complexity with multiple interrelated concerns
- Extensive dependency network (15+ importing files)
- Novel refactoring patterns not seen in project
- High risk of breaking changes
- Central to multiple systems or features
- Complex type hierarchies or generics

**Example:** Core service file used throughout application

---

### Risk Assessment Checklist:

**Low Risk Indicators:**

- [ ] File is isolated with few consumers
- [ ] Clear separation of concerns
- [ ] Simple import/export structure
- [ ] No circular dependencies
- [ ] Minimal global state

**High Risk Indicators:**

- [ ] Used by many files across project
- [ ] Complex type dependencies
- [ ] Circular dependency chains
- [ ] Side effects or global state
- [ ] Critical business logic

---

## ⚡ STEP 4: EXECUTE CHOSEN STRATEGY

### For Direct Refactoring:

Proceed with straightforward refactoring using initial analysis and project context.

**Safety Checklist:**

- [ ] Review project patterns before making changes
- [ ] Preserve exact functionality
- [ ] Maintain all exports with same signatures
- [ ] Update imports systematically
- [ ] Verify TypeScript compilation

---

### For Sub-Agent Approaches:

**YOU HAVE COMPLETE AUTONOMY** to design and launch custom sub-agents based on specific refactoring needs.

#### Core Investigation Areas:

**1. File Structure Analysis**

- Component boundaries and cohesion
- Logical split points
- Single Responsibility Principle compliance
- Opportunities for abstraction

**2. Dependency Network Mapping**

- All files importing from target
- External dependencies used
- Circular dependency detection
- Import path impact analysis

**3. Project Pattern Compliance**

- Directory structure conventions
- Naming patterns
- Export/import organization
- File size and complexity norms

**4. Impact Assessment**

- Test files requiring updates
- Configuration files affected
- Build scripts dependencies
- Documentation updates needed

**5. Type Safety Analysis**

- TypeScript type dependencies
- Generic type usage patterns
- Interface compatibility
- Type export strategy

**6. Breaking Change Prevention**

- API surface analysis
- Backward compatibility checks
- Migration path planning
- Consumer code impact

---

#### Autonomous Sub-Agent Design Principles:

**Custom Specialization:**
Design agents for the specific file's unique challenges. Don't use generic agents when custom investigation is needed.

**Flexible Agent Count:**
Use exactly as many agents as needed - no more, no less. Scale based on actual complexity and risk.

**Adaptive Coverage:**
Ensure all high-risk aspects are investigated without unnecessary overlap.

**Parallel Execution:**
**CRITICAL**: Always launch sub-agents in parallel using a single message with multiple Task tool invocations for maximum efficiency.

---

#### Sub-Agent Task Template:

```markdown
Task: "Analyze [SPECIFIC_AREA] for safe refactoring of [TARGET_FILE]"

Investigation Protocol:

1. Review auto-loaded project context (CLAUDE.md, project-structure.md)
2. [CUSTOM_ANALYSIS_STEPS] - Deep investigation of specific area
3. Identify risks and safety concerns
4. Propose mitigation strategies
5. Return actionable findings

CRITICAL: Focus on preventing breaking changes.

Required Output:

- Specific findings for this investigation area
- Risk assessment and mitigation strategies
- Recommendations for safe implementation
```

---

## 🎨 STEP 5: SYNTHESIZE ANALYSIS & PLAN REFACTORING

**Think deeply about creating a cohesive refactoring strategy that minimizes risk.**

### Integration Framework:

**Combine All Findings:**

```
□ File structure recommendations
□ Dependency safety constraints
□ Project pattern requirements
□ Impact mitigation strategies
□ Type safety preservation plan
□ Import update roadmap
```

### Refactoring Strategy Definition:

**1. Split Granularity Decision**

```
Consider:
- Logical cohesion of components
- Single Responsibility Principle
- Testability improvements
- Reusability opportunities
- Maintenance burden vs benefit

Decide:
- How many files to create
- What logical divisions to use
- Level of abstraction needed
```

**2. Directory Structure Planning**

```
Options:
- Same-level split: Files stay in current directory
- Subdirectory grouping: Create new folder for related files
- Existing directory: Move to appropriate existing location

Choose based on:
- Project conventions (from auto-loaded context)
- Related file organization
- Logical grouping principles
```

**3. Import/Export Strategy**

```
Plan:
- Export reorganization approach
- Re-export patterns (if needed)
- Import path updates for all consumers
- Type export strategy
- Barrel file usage (if applicable)

Ensure:
- Zero breaking changes to consumers
- TypeScript type resolution maintained
- Tree-shaking compatibility preserved
```

**4. File Naming Convention**

```
Follow:
- Project naming patterns
- Clarity and descriptiveness
- Consistency with similar files
- Avoid overly generic names
```

---

### Comprehensive Risk Assessment:

**Breaking Change Analysis:**

```
Identify:
□ API surface changes (prevent!)
□ Type signature modifications (prevent!)
□ Export name changes (carefully manage)
□ Import path changes (systematically update)

Mitigate:
□ Maintain exact same exports
□ Preserve all type exports
□ Use re-exports if needed for compatibility
□ Update all import paths atomically
```

**Dependency Conflict Prevention:**

```
Check:
□ Circular dependency creation
□ Import cycle introduction
□ Type dependency loops
□ Module resolution issues

Prevent:
□ Analyze before splitting
□ Design clear dependency flow
□ Use dependency injection if needed
□ Validate with TypeScript compiler
```

**Test Impact Planning:**

```
Identify:
□ Unit test files to update
□ Integration tests affected
□ Mock/stub locations
□ Test import paths

Plan:
□ Systematic test file updates
□ Test coverage preservation
□ New test file creation if needed
```

---

## ⚖️ STEP 6: REFACTORING VALUE ASSESSMENT

**CRITICAL GATE: Evaluate if refactoring truly improves the codebase.**

### Positive Indicators (✅ Worth Refactoring):

**Size-Based:**

- [ ] File significantly exceeds reasonable limits:
  - Components: >500 lines
  - Utilities: >1000 lines
  - Services: >800 lines
  - Hooks: >300 lines

**Quality-Based:**

- [ ] Clear Separation of Concerns violations
- [ ] UI logic mixed with business logic
- [ ] Multiple unrelated features in one file
- [ ] High cyclomatic complexity (reducible)
- [ ] Repeated code patterns (abstractable)
- [ ] Poor testability (improvable)
- [ ] Difficult to navigate/understand
- [ ] Frequent merge conflicts

**Architectural:**

- [ ] Dependencies would become cleaner
- [ ] Aligns with project patterns
- [ ] Improves reusability
- [ ] Enhances maintainability
- [ ] Facilitates team collaboration

---

### Negative Indicators (❌ NOT Worth Refactoring):

**Well-Organized:**

- [ ] File is already well-structured despite size
- [ ] High cohesion - serves single purpose effectively
- [ ] Clear internal organization
- [ ] Easy to understand and navigate
- [ ] Low cyclomatic complexity

**Counterproductive:**

- [ ] Splitting creates artificial boundaries
- [ ] Would introduce unnecessary abstraction
- [ ] Dependencies become more convoluted
- [ ] Reduces code clarity
- [ ] Violates project conventions
- [ ] Minimal actual improvement
- [ ] Over-engineering for current needs

**Context-Appropriate:**

- [ ] File size justified by feature complexity
- [ ] Natural cohesion of contained functionality
- [ ] Good internal structure and comments
- [ ] No maintenance issues reported
- [ ] Team comfortable with current structure

---

### Decision Point - MANDATORY USER CONSULTATION:

**IF REFACTORING IS WORTH IT:**

```markdown
✅ **RECOMMENDATION: Proceed with refactoring**

**Benefits:**

1. [Specific improvement 1]
2. [Specific improvement 2]
3. [Specific improvement 3]

**Approach:**
[Brief description of refactoring strategy]

**Risk Level:** [Low/Medium/High]
**Risk Mitigation:** [How risks will be prevented]

Proceeding automatically to execution...
```

**IF REFACTORING IS NOT WORTH IT:**

```markdown
❌ **RECOMMENDATION: Skip refactoring**

**Reasons:**

1. [Specific reason 1]
2. [Specific reason 2]
3. [Specific reason 3]

**Current State Assessment:**
The file is currently well-structured for its purpose because:

- [Strength 1]
- [Strength 2]

**Alternative Suggestions:**
Instead of refactoring, consider:

- [Alternative improvement 1]
- [Alternative improvement 2]

⚠️ **USER DECISION REQUIRED:**
The file is well-structured. Do you still want to proceed? (yes/no)

[WAIT FOR USER CONFIRMATION BEFORE PROCEEDING]
```

---

## 🔨 STEP 7: EXECUTE REFACTORING

**Only execute after passing Step 6 assessment or receiving user confirmation.**

### Execution Order (CRITICAL - Follow Sequence):

**Phase 1: Directory Preparation**

```
1. Create new directories (if needed)
2. Verify directory structure matches project patterns
3. Ensure no naming conflicts
```

**Phase 2: File Creation (Bottom-Up)**

```
1. Create type definition files first
2. Create constant/enum files
3. Create utility/helper files
4. Create core functionality files
5. Create index/barrel files (if applicable)
```

**Phase 3: Content Migration**

```
1. Copy code to new files with exact preservation
2. Maintain all exports with same names/signatures
3. Preserve comments and documentation
4. Keep formatting consistent
```

**Phase 4: Import/Export Restructuring**

```
1. Update internal imports within split files
2. Create proper exports from new files
3. Set up re-exports if needed for compatibility
4. Verify no circular dependencies created
```

**Phase 5: Consumer Updates**

```
1. Find ALL files importing from original file
2. Update import paths systematically
3. Verify imports resolve correctly
4. Check for any dynamic imports
```

**Phase 6: Original File Update**

```
1. Replace with new modular structure OR
2. Convert to barrel file re-exporting from splits OR
3. Remove if no longer needed (after updating all consumers)
```

---

### Import/Export Management - DETAILED:

**Export Preservation:**

```typescript
// BEFORE (original file)
export function utilityA() {}
export function utilityB() {}
export type MyType = {};

// AFTER (new files)
// file-a.ts
export function utilityA() {}

// file-b.ts
export function utilityB() {}

// types.ts
export type MyType = {};

// index.ts (barrel file - optional for backward compatibility)
export { utilityA } from "./file-a";
export { utilityB } from "./file-b";
export type { MyType } from "./types";
```

**Import Path Updates:**

```typescript
// Consuming file BEFORE
import { utilityA, MyType } from "../utils/original-file";

// Consuming file AFTER (Option 1 - direct imports)
import { utilityA } from "../utils/file-a";
import { MyType } from "../utils/types";

// Consuming file AFTER (Option 2 - barrel file)
import { utilityA, MyType } from "../utils"; // if index.ts exists
```

**Type Safety Verification:**

```
□ All type exports preserved
□ Generic types maintain parameters
□ Interface extensions intact
□ Type-only imports marked correctly
□ No implicit any introduced
```

---

### Quality Assurance Checklist:

**Functionality Preservation:**

- [ ] Zero breaking changes to API surface
- [ ] All exports maintain exact signatures
- [ ] Behavior preserved exactly
- [ ] No side effect changes
- [ ] Error handling unchanged

**Type Safety:**

- [ ] TypeScript compilation successful
- [ ] No new type errors introduced
- [ ] All type exports accessible
- [ ] Generic types work correctly
- [ ] Inference works as before

**Code Quality:**

- [ ] Follows project coding standards
- [ ] Consistent formatting applied
- [ ] Comments/documentation preserved
- [ ] No linting errors introduced
- [ ] Naming conventions followed

**Import Integrity:**

- [ ] All imports resolve correctly
- [ ] No circular dependencies
- [ ] Tree-shaking compatibility maintained
- [ ] Module boundaries clear
- [ ] No unused imports

---

## ✅ STEP 8: VERIFICATION & VALIDATION

**Mandatory verification before considering refactoring complete.**

### Multi-Layer Verification:

**Level 1: Syntax & Compilation**

```bash
□ Run TypeScript compiler
□ Check for compilation errors
□ Verify no new warnings
□ Validate type definitions
```

**Level 2: Import Resolution**

```
□ All import paths resolve
□ No missing module errors
□ Barrel files export correctly
□ Type imports accessible
```

**Level 3: Functionality Check**

```
□ Build succeeds completely
□ No runtime errors introduced
□ Core functionality unchanged
□ Side effects preserved
```

**Level 4: Project Integration**

```
□ Fits project structure patterns
□ Follows naming conventions
□ Matches similar file organization
□ Documentation updated if needed
```

---

### Rollback Triggers:

**Immediate rollback if:**

- TypeScript compilation fails
- Build process breaks
- Import resolution errors
- Circular dependencies created
- Tests fail that previously passed

**User consultation if:**

- Unexpected complexity discovered
- Alternative approach seems better
- Risk level higher than anticipated
- Breaking changes unavoidable

---

## 🚨 ERROR HANDLING PROTOCOL

### File-Level Errors:

**File Not Found:**

```
Response: "❌ Cannot refactor @path/to/file.ts - file does not exist at this path."
Action: Skip file and continue with others
```

**Parse/Syntax Errors:**

```
Response: "❌ Cannot safely refactor @path/to/file.ts - file contains syntax errors that must be fixed first."
Action: Report specific errors, skip file
```

**Circular Dependencies:**

```
Response: "⚠️ Detected circular dependency in @path/to/file.ts - requires careful resolution strategy."
Action: Consult user on approach
```

---

### Process-Level Errors:

**Import Conflicts:**

```
Response: "⚠️ Import path conflict detected during refactoring."
Action: Report affected files, propose resolution
```

**Type Resolution Failures:**

```
Response: "❌ TypeScript type resolution failed after refactoring."
Action: Rollback changes, report issue
```

**Build Failures:**

```
Response: "❌ Build failed after refactoring - rolling back changes."
Action: Immediate rollback, report error details
```

---

## 📊 COMPREHENSIVE SUMMARY FORMAT

After completion, provide structured summary:

```markdown
# 🏗️ Refactoring Summary

## 📁 Files Processed

- ✅ @path/to/file-1.ts - Refactored successfully
- ⚠️ @path/to/file-2.ts - Skipped (not worth refactoring)
- ❌ @path/to/file-3.ts - Error (file not found)

---

## 🔍 Analysis Results

### File 1 Analysis:

**Strategy Used:** [Direct/Focused/Comprehensive]
**Complexity Assessment:** [Low/Medium/High]
**Risk Level:** [Low/Medium/High]

**Key Findings:**

- [Finding 1]
- [Finding 2]
- [Finding 3]

---

## ⚖️ Value Assessment

### ✅ Refactored Files:

**File 1:**

- **Benefits:** [List specific improvements]
- **Approach:** [Brief strategy description]
- **Safety Measures:** [Risk mitigation applied]

### ⚠️ Skipped Files:

**File 2:**

- **Reason:** [Why not worth refactoring]
- **Current State:** [Why current structure is acceptable]
- **Alternative Suggestions:** [Other improvements if any]

---

## 🎯 Refactoring Strategy

### File Structure Changes:
```

Before:
├── original-file.ts (500 lines)

After:
├── feature-a/
│ ├── component.tsx
│ └── logic.ts
├── feature-b/
│ └── utils.ts
└── index.ts (barrel file)

```

### Organization Rationale:
[Explanation of why this structure was chosen]

---

## 📦 Files Created

### New Files:
1. **path/to/new-file-1.ts** (150 lines)
   - Purpose: [Description]
   - Exports: [What it exports]
   - Used by: [# of consumers]

2. **path/to/new-file-2.ts** (200 lines)
   - Purpose: [Description]
   - Exports: [What it exports]
   - Used by: [# of consumers]

[... continue for all new files]

---

## 🔗 Dependencies Updated

### Import Updates:
- Updated **15 files** with new import paths
- No breaking changes to API surface
- All type exports preserved

### Affected Files:
1. `src/components/Feature.tsx` - Updated imports
2. `src/services/DataService.ts` - Updated imports
[... list all affected files]

---

## ✅ Verification Results

**TypeScript Compilation:** ✅ Pass
**Import Resolution:** ✅ All imports resolve
**Build Process:** ✅ Successful
**Type Safety:** ✅ No new type errors
**Linting:** ✅ No new errors

---

## ⚠️ Issues Encountered

### Resolved:
1. **Issue:** [Description]
   **Resolution:** [How it was fixed]

### Warnings:
1. **Warning:** [Description]
   **Recommendation:** [What user should do]

---

## 📋 Next Steps

### Recommended Actions:
1. [ ] Review refactored code
2. [ ] Run full test suite
3. [ ] Update related documentation
4. [ ] Commit changes with descriptive message

### Future Improvements:
- [Suggestion 1]
- [Suggestion 2]
```

---

## 🎬 EXECUTION TRIGGER

Now proceed with safe, multi-agent refactoring analysis of the tagged files: **$ARGUMENTS**

**Remember**: Safety first. Improve without breaking. Validate everything.
