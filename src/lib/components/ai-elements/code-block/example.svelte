<script lang="ts">
	import { CodeBlock, CodeBlockCopyButton } from './index.js';

	const jsCode = `function MyComponent(props) {
  return (
    <div>
      <h1>Hello, {props.name}!</h1>
      <p>This is an example React component.</p>
    </div>
  );
}`;

	const pythonCode = `def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

# Generate first 10 fibonacci numbers
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`;

	function handleCopy() {
		console.log('Code copied to clipboard!');
	}

	function handleError(error: Error) {
		console.error('Failed to copy code:', error);
	}
</script>

<div class="max-w-4xl mx-auto p-6 space-y-6">
	<h1 class="text-2xl font-bold">CodeBlock Component Examples</h1>
	
	<div class="space-y-4">
		<h2 class="text-xl font-semibold">JavaScript Example with Copy Button</h2>
		<CodeBlock code={jsCode} language="javascript">
			<CodeBlockCopyButton 
				onCopy={handleCopy} 
				onError={handleError}
			/>
		</CodeBlock>
	</div>

	<div class="space-y-4">
		<h2 class="text-xl font-semibold">Python Example</h2>
		<CodeBlock 
			code={pythonCode} 
			language="python"
		>
			<CodeBlockCopyButton 
				onCopy={handleCopy} 
				onError={handleError}
			/>
		</CodeBlock>
	</div>

	<div class="space-y-4">
		<h2 class="text-xl font-semibold">TypeScript Example (Simple)</h2>
		<CodeBlock 
			code={`interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
};`} 
			language="typescript"
		/>
	</div>
</div>
