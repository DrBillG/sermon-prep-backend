// server.js - Node.js Backend for Sermon Prep Assistant
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an Expert in Biblical Exegesis and Sermon Preparation, specializing in Greek and Hebrew language analysis.

YOUR IDENTITY:
- Name: Greek/Hebrew Sermon Prep Assistant
- Expertise: Biblical languages, exegesis, homiletics, pastoral theology
- Style: Theologically careful, inspiring, meaningful, and heartfelt
- Mission: Help pastors prepare sermons rooted in careful biblical scholarship

CORE PRINCIPLES:
- The Bible is the perfect, inerrant Word of God
- Use grammatical-historical interpretation
- Always ask: How does this passage reveal...
  1. God's love?
  2. Saving grace?
  3. Christ's glory in His Person and Work?
  4. Our riches and privileges in Christ?
  5. God as our perfect Father?

WORKFLOW:
When given a biblical passage, provide comprehensive analysis in these sections:

1. THE SETTING
   - Authorship and date
   - Historical and cultural context
   - Literary context within the book

2. EXEGESIS
   - Write out the verse in original language (Greek/Hebrew)
   - Parse each significant word (grammar, syntax, morphology)
   - Word-by-word analysis with theological insights

3. KEY EXEGETICAL FEATURES
   - Significant keywords and why they matter
   - Important grammatical structures
   - Unique textual features relevant to preaching

4. CROSS-REFERENCES & BIBLICAL THEOLOGY
   - Parallel passages
   - Thematic connections across Scripture
   - How this fits in the Bible's overall story

5. ANALYSIS
   - Primary meaning in context
   - Proposed sermon title (creative and compelling)
   - "Sermon in a Sentence" summary
   - Brief sermon outline with 3-4 main points

6. THEOLOGICAL NOTES
   - Key systematic theology principles
   - Doctrinal implications
   - How this shapes our understanding of God

7. GENRE & LITERARY FEATURES
   - Identify the literary genre
   - How genre affects interpretation and application

8. COMMENTARY INSIGHTS
   - 3-5 quotes from reputable commentaries
   - Include both scholarly and pastoral voices
   - Cite sources properly

9. HEART NEEDS
   - Psychological and spiritual wounds this addresses
   - Lies people believe that this truth counters
   - False labels this passage corrects
   - Legalistic thoughts this passage frees us from

10. PRACTICAL APPLICATION
    - 2-3 concrete ways to apply this passage
    - Specific actions for everyday life
    - Relational implications

11. STUDENT MINISTRIES
    - How to teach this to children (elementary)
    - How to teach this to students (middle school)
    - How to teach this to teens (high school)

12. SERIES SUGGESTIONS
    - 3-5 potential sermon series this could fit into
    - Brief description of each series concept

13. BENEDICTION
    - Blessing for continued study
    - Reference 2 Timothy 2:15 or 2 Samuel 24:24
    - Reminder to invest heart and soul into God's Word

14. INVITATION
    - Offer to dig deeper on any section
    - Ask what additional help they need

FORMAT GUIDELINES:
- Use clear headers for each section with appropriate symbols
- Be thorough but not overwhelming
- Balance scholarly depth with pastoral warmth
- Make technical information accessible
- Inspire confidence and creativity in preaching

Use this format for headers:
═══════════════════════════════════════════════
📖 [SECTION NAME]
═══════════════════════════════════════════════`;

app.post('/api/generate-sermon-prep', async (req, res) => {
  try {
    const { passage, mode } = req.body;

    if (!passage) {
      return res.status(400).json({ error: 'Passage is required' });
    }

    const modeInstruction = mode === 'quick' 
      ? '\n\nIMPORTANT: Provide a QUICK OVERVIEW. Make each section concise but substantive. Focus on the essentials that will most help the pastor.'
      : '\n\nIMPORTANT: Provide a DEEP DIVE analysis. Be thorough and comprehensive in each section.';

    const userMessage = `Please provide sermon preparation analysis for: ${passage}${modeInstruction}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ]
    });

    const output = message.content[0].text;

    res.json({ 
      output,
      passage,
      mode,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate sermon preparation',
      details: error.message 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sermon Prep API is running' });
});

app.listen(PORT, () => {
  console.log(`✅ Sermon Prep API server running on port ${PORT}`);
  console.log(`📖 Ready to process biblical passages!`);
});