// src/components/ChapterControls.tsx
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChapterControlsProps {
  chapterTitle: string;
  chapterContent: string;
}

const ChapterControls: React.FC<ChapterControlsProps> = ({ chapterTitle, chapterContent }) => {
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [personalizedContent, setPersonalizedContent] = useState<string>(chapterContent);
  const [translatedContent, setTranslatedContent] = useState<string>(chapterContent);
  const [isPersonalized, setIsPersonalized] = useState<boolean>(false);
  const [isTranslated, setIsTranslated] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);

    // Check if user is authenticated
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Failed to parse user from localStorage', error);
        }
      }
    }
  }, []);

  // Function to personalize content
  const personalizeContent = () => {
    if (!user) return chapterContent;

    // Replace generic terms with user-specific information
    let personalized = chapterContent.replace(/user/gi, user.name);
    personalized = personalized.replace(/reader/gi, user.name);
    personalized = personalized.replace(/one can/gi, `${user.name} can`);
    personalized = personalized.replace(/people/gi, `${user.name} and others`);

    // Add a welcome message at the beginning
    return `## Welcome ${user.name}!\n\n${personalized}`;
  };

  // Function to translate content to Urdu
  // In a real application, you would use an API to translate content
  // For demo purposes, I'll return a placeholder with actual translated content
  const translateToUrdu = () => {
    // This is a placeholder translation - in a real app, you'd call a translation API
    // For this example, I'll provide a sample of what a translated version might look like
    return `# فصل 1: روبوٹکس کا تعارف

## جائزہ

روبوٹکس ایک میکانک انجینئرنگ، برقی انجینئرنگ، کمپیوٹر سائنس اور دیگر مضامین کا ایک حوالہ جاتی شعبہ ہے جو ڈیزائن، تعمیر، آپریٹ، اور روبوٹس کو استعمال کرنے کے لئے مخصوص ہے۔ یہ فصل روبوٹکس اور اس کی درخواستوں کی بنیادی سمجھ کے لئے ایک فراہم کرتی ہے۔

## روبوٹ کیا ہے؟

ایک روبوٹ ایک پروگرام کردہ مشین ہے جو خودکار طور پر پیچیدہ اعمال کی انجام دہی کر سکتی ہے۔ روبوٹس کو ایک خارجی کنٹرول ڈیوائس کے ذریعے چلایا جا سکتا ہے یا کنٹرول ایمبیڈڈ بھی ہو سکتا ہے۔ روبوٹس خود مختار یا نیم خود مختار ہو سکتے ہیں اور ہونڈا کے ASIMO جیسے انسان نما سے لے کر صنعتی روبوٹس، میڈیکل آپریٹنگ روبوٹس، مریض کی دیکھ بھال والے روبوٹس، کتے کے علاج کے روبوٹس، مجموعی طور پر پروگرام کردہ سوئرم روبوٹس، امریکی آرمی کے بیٹل فیلڈ روبوٹس، اور فیکٹریوں میں موجود مینوفیکچرنگ روبوٹس تک پھیلے ہوئے ہیں۔

## روبوٹ کے اہم اجزاء

### 1. میکانیکل اجزاء
- ڈھانچہ اور چیسی
- ایکٹو ایٹرز (موٹرز، پسٹن)
- جوڑ اور ڈگریاں حرکت
- اختتامی ایفیکٹرز (گرپرز، ٹولز)

## خلاصہ

یہ فصل نے روبوٹکس کے بنیادی تصورات کا تعارف پیش کیا، بشمول ایک روبوٹ کی تعریف، اس کے اہم اجزاء، اقسام، اطلاقیہ، اور تاریخی سیاق و سباق۔ ان بنیادوں کو سمجھنا اہم ہے کیونکہ ہم اگلے ابواب میں روبوٹکس کے تکنیکی پہلوؤں میں گہرائی سے جاتے ہیں۔`;
  };

  const handlePersonalize = () => {
    const newPersonalizedContent = personalizeContent();
    setPersonalizedContent(newPersonalizedContent);
    setIsPersonalized(true);
  };

  const handleTranslate = () => {
    const newTranslatedContent = translateToUrdu();
    setTranslatedContent(newTranslatedContent);
    setIsTranslated(true);
  };

  const resetContent = () => {
    setPersonalizedContent(chapterContent);
    setTranslatedContent(chapterContent);
    setIsPersonalized(false);
    setIsTranslated(false);
  };

  // Determine which content to display
  let displayContent = chapterContent;
  if (isTranslated) {
    displayContent = translatedContent;
  } else if (isPersonalized) {
    displayContent = personalizedContent;
  }

  return (
    <div className="chapter-controls">
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>{chapterTitle}</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
          {isClient && user ? (
            <>
              <button
                onClick={handlePersonalize}
                disabled={isPersonalized}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isPersonalized ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isPersonalized ? 'not-allowed' : 'pointer'
                }}
              >
                {isPersonalized ? 'Personalized ✓' : 'Personalize Content'}
              </button>

              <button
                onClick={handleTranslate}
                disabled={isTranslated}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isTranslated ? '#ccc' : '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isTranslated ? 'not-allowed' : 'pointer'
                }}
              >
                {isTranslated ? 'Translated to Urdu ✓' : 'Translate to Urdu'}
              </button>

              {(isPersonalized || isTranslated) && (
                <button
                  onClick={resetContent}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Reset Content
                </button>
              )}
            </>
          ) : (
            <p style={{ color: '#666' }}>
              Please <a href="/signin" style={{ color: '#2196F3' }}>sign in</a> to use personalization and translation features.
            </p>
          )}
        </div>
      </div>

      <div className="chapter-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom components to handle specific markdown elements
            h1: ({node, ...props}) => <h1 style={{color: '#25c2a0'}} {...props} />,
            h2: ({node, ...props}) => <h2 style={{color: '#25c2a0'}} {...props} />,
            h3: ({node, ...props}) => <h3 style={{color: '#25c2a0'}} {...props} />,
            a: ({node, ...props}) => <a style={{color: '#25c2a0'}} {...props} />,
            code: ({node, ...props}) => <code style={{backgroundColor: '#f0f0f0', padding: '2px 4px', borderRadius: '3px'}} {...props} />,
            pre: ({node, ...props}) => <pre style={{backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px', overflowX: 'auto'}} {...props} />,
          }}
        >
          {displayContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ChapterControls;