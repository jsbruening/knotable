// Test script to verify OpenAI integration
import { generateCampaignContent, generateQuizQuestions } from './src/lib/openai.js';

async function testOpenAI() {
  console.log('🧪 Testing OpenAI integration...');
  
  try {
    // Test campaign content generation
    console.log('📝 Testing campaign content generation...');
    const campaignContent = await generateCampaignContent(
      'Create a learning campaign for JavaScript fundamentals'
    );
    console.log('✅ Campaign content generated:', campaignContent.substring(0, 100) + '...');
    
    // Test quiz generation
    console.log('❓ Testing quiz generation...');
    const quizData = await generateQuizQuestions('JavaScript', 2);
    console.log('✅ Quiz generated:', quizData);
    
    console.log('🎉 All tests passed! OpenAI integration is working.');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOpenAI();

