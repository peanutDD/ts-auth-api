const validator = require('validator');

// 测试各种情况
const testCases = [
  { input: 'test', description: '英文' },
  { input: '测试', description: '汉字' },
  { input: 'test123', description: '英文+数字' },
  { input: '测试123', description: '汉字+数字' },
  { input: 'test测试', description: '英文+汉字' },
  { input: 'a', description: '单字符英文' },
  { input: '测', description: '单字符汉字' }
];

console.log('验证validator库字符长度计算：');
console.log('=' .repeat(50));

for (const test of testCases) {
  const jsLength = test.input.length;
  const isLength5 = validator.isLength(test.input, { min: 5 });
  const isLength2 = validator.isLength(test.input, { min: 2 });
  const isLength1 = validator.isLength(test.input, { min: 1 });
  
  console.log(`输入: "${test.input}" (${test.description})`);
  console.log(`- JavaScript length: ${jsLength}`);
  console.log(`- 是否至少5个字符: ${isLength5}`);
  console.log(`- 是否至少2个字符: ${isLength2}`);
  console.log(`- 是否至少1个字符: ${isLength1}`);
  console.log('-' .repeat(50));
}

// 特别测试用户名长度限制（项目中要求至少6个字符）
const usernameTestCases = [
  { input: 'user12', description: '6个英文+数字' },
  { input: '测试1234', description: '2个汉字+4个数字' },
  { input: '测试测试', description: '4个汉字' },
  { input: '测试测试1', description: '4个汉字+1个数字' },
  { input: '测试测试12', description: '4个汉字+2个数字' }
];

console.log('\n用户名长度限制测试（至少6个字符）：');
console.log('=' .repeat(50));

for (const test of usernameTestCases) {
  const jsLength = test.input.length;
  const isValidLength = validator.isLength(test.input, { min: 6 });
  
  console.log(`用户名: "${test.input}" (${test.description})`);
  console.log(`- JavaScript length: ${jsLength}`);
  console.log(`- 是否满足至少6个字符要求: ${isValidLength}`);
  console.log('-' .repeat(50));
}