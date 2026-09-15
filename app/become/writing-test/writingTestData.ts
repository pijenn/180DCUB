export interface TrackTest {
  id: string;
  name: string;
  isComingSoon?: boolean;
  testDescription: string[];
  testMechanism: {
    points: string[];
    links?: { label: string; url: string; badge?: string }[];
  };
  writingTestDetail: {
    points: string[];
    questions?: {
      title?: string;
      options?: string[];
      prompt?: string;
    }[];
    links?: { label: string; url: string; badge?: string }[];
  };
  contactPerson?: {
    name: string;
    phone: string;
  };
}

export interface DepartmentTest {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  isComingSoon?: boolean;
  tracks: TrackTest[];
}

export const WRITING_TEST_DEPARTMENTS: DepartmentTest[] = [
  {
    id: 'hr',
    name: 'Human Resources',
    shortName: 'HR',
    logo: '/logodept/hr.png',
    isComingSoon: true,
    tracks: [
      {
        id: 'hr-general',
        name: 'Human Resources',
        isComingSoon: true,
        testDescription: [
          'Coming Soon',
          'The writing test prompt for Human Resources is currently being prepared and will be published shortly. Please check back soon or follow official announcements.'
        ],
        testMechanism: {
          points: [
            'Coming Soon',
            'Test mechanism instructions and submission details will be available soon.'
          ]
        },
        writingTestDetail: {
          points: [
            'Coming Soon',
            'Assessment criteria and prompt details will be available soon.'
          ]
        }
      }
    ]
  },
  {
    id: 'sng',
    name: 'Strategy & Growth',
    shortName: 'Strategy & Growth',
    logo: '/logodept/sng.png',
    tracks: [
      {
        id: 'product',
        name: 'Product',
        testDescription: [
          'This writing test is designed to help us understand you beyond your experiences, achievements, and technical skills. Through your responses, we aim to learn more about your personality, mindset, values, perspectives, and the way you approach different situations.',
          'Please answer each question honestly and authentically. There are no strictly right or wrong answers. We value genuine responses that reflect who you are.',
          'There are two types of questions in this test:',
          '• Multiple-Choice with Explanation: You will be asked to choose an option and explain the reasoning behind your choice.',
          '• Open-Ended Questions: You will be asked to provide your thoughts, opinions, experiences, or perspectives in your own words.',
          'Please ensure that your answers genuinely represent your personality and personal perspective.',
          'The quantity of words or sentences will not determine your score. We prioritize the quality, authenticity, clarity, and thoughtfulness of your responses.',
          'The maximum length for each answer is 250 words.'
        ],
        testMechanism: {
          points: [
            'Please complete the test using the provided answer template.',
            'Read each question carefully before responding.',
            'Answer based on your genuine thoughts, experiences, and perspectives.',
            'There is no need to provide overly long answers. Focus on delivering meaningful and well-structured responses.',
            'You may answer in either English or Bahasa Indonesia.',
            'Please ensure that your responses are clear and easy to understand.',
            'Important Rules:',
            '• The submission deadline will be communicated separately.',
            '• Starting from September 21, a penalty of 5 points per day will be deducted for late submissions.',
            '• Participants are strictly prohibited from using Artificial Intelligence (AI) tools or any similar external assistance to generate their answers.',
            '• Any participant found using AI-generated responses will receive a 75% deduction from their final score.',
            '• We strongly encourage participants to complete the test independently and honestly.',
            '• If you have any questions or encounter difficulties regarding the test, please contact us through WhatsApp.'
          ],
          links: [
            {
              label: 'Strategy & Growth Answer Template',
              url: 'https://docs.google.com/document/d/1gn7nn52ELvmTjbDa0EzKeQW8dRjHjx49qd_zxZZ8JK4/edit?usp=sharing',
              badge: 'Google Docs'
            }
          ]
        },
        writingTestDetail: {
          points: [
            'The Personality Writing Test is designed to provide a deeper understanding of each candidate as an individual. While interviews and previous experiences can demonstrate a person\'s achievements and capabilities, this test focuses more on understanding their personality, mindset, values, self-awareness, and perspectives.',
            'Through this assessment, we aim to understand:',
            '• How you perceive yourself and your personal strengths and weaknesses.',
            '• How you approach challenges, uncertainty, and unfamiliar situations.',
            '• How you communicate your thoughts and ideas.',
            '• How you reflect on your experiences and learn from them.',
            '• How you respond to different situations and make decisions.',
            '• Your personal values and the principles that influence your actions.',
            '• How your personality and mindset may contribute to working within a team and organization.',
            'This test is not intended to judge whether your personality is good or bad. Every individual has different perspectives, experiences, and ways of thinking. Therefore, we encourage you to focus on being honest, authentic, and reflective in your responses.',
            'Please do not try to provide answers that you think the organization wants to hear. Instead, provide answers that genuinely represent who you are. Remember, there are no perfect answers. What matters most is the authenticity and thoughtfulness behind your response.'
          ],
          questions: [
            {
              title: 'Question 1',
              prompt: 'You arrive at a place with four doors. You may only choose one. Which door would you choose and why?',
              options: [
                'Door A : A door that leads to a familiar and predictable environment.',
                'Door B : A door that leads to an unknown place full of possibilities.',
                'Door C : A door that leads to a room filled with people who need your help.',
                'Door D : A door that leads to a difficult challenge that no one has solved yet.'
              ]
            },
            {
              title: 'Question 2',
              prompt: 'You are given an empty room and complete freedom to transform it. What would you turn it into? Which would you choose and why?',
              options: [
                'A. A workspace',
                'B. A place for people to gather',
                'C. A space for creativity and experimentation',
                'D. A quiet place for reflection'
              ]
            },
            {
              title: 'Question 3',
              prompt: 'Imagine you are working on an important project with a team. Naturally, you tend to become: Which role best represents you, and please provide an example from your experience.',
              options: [
                'A. The person who organizes and keeps everyone on track.',
                'B. The person who generates ideas and explores possibilities.',
                'C. The person who supports and ensures everyone feels included.',
                'D. The person who analyzes problems and challenges existing ideas.'
              ]
            },
            {
              title: 'Question 4',
              prompt: 'At the end of your journey in an organization, which would you rather be remembered for? Which would you choose and why?',
              options: [
                'A. Creating meaningful results.',
                'B. Helping other people grow.',
                'C. Bringing new ideas and changes.',
                'D. Being someone people could always rely on.'
              ]
            },
            {
              title: 'Question 5 (Open-Ended)',
              prompt: 'You have developed a product that appears to fit your intended market segment. However, the product is struggling to acquire customers. How would you identify the underlying causes of this problem, and what steps would you take to improve customer acquisition?'
            }
          ]
        },
        contactPerson: {
          name: 'Rafie',
          phone: '085694477190'
        }
      },
      {
        id: 'program',
        name: 'Program',
        testDescription: [
          'This writing test is designed to help us understand you beyond your experiences, achievements, and technical skills. Through your responses, we aim to learn more about your personality, mindset, values, perspectives, and the way you approach different situations.',
          'Please answer each question honestly and authentically. There are no strictly right or wrong answers. We value genuine responses that reflect who you are.',
          'There are two types of questions in this test:',
          '• Multiple-Choice with Explanation: You will be asked to choose an option and explain the reasoning behind your choice.',
          '• Open-Ended Questions: You will be asked to provide your thoughts, opinions, experiences, or perspectives in your own words.',
          'Please ensure that your answers genuinely represent your personality and personal perspective.',
          'The quantity of words or sentences will not determine your score. We prioritize the quality, authenticity, clarity, and thoughtfulness of your responses.',
          'The maximum length for each answer is 250 words.'
        ],
        testMechanism: {
          points: [
            'Please complete the test using the provided answer template.',
            'Read each question carefully before responding.',
            'Answer based on your genuine thoughts, experiences, and perspectives.',
            'There is no need to provide overly long answers. Focus on delivering meaningful and well-structured responses.',
            'You may answer in either English or Bahasa Indonesia.',
            'Please ensure that your responses are clear and easy to understand.',
            'Important Rules:',
            '• The submission deadline will be communicated separately.',
            '• Starting from September 21, a penalty of 5 points per day will be deducted for late submissions.',
            '• Participants are strictly prohibited from using Artificial Intelligence (AI) tools or any similar external assistance to generate their answers.',
            '• Any participant found using AI-generated responses will receive a 75% deduction from their final score.',
            '• We strongly encourage participants to complete the test independently and honestly.',
            '• If you have any questions or encounter difficulties regarding the test, please contact us through WhatsApp.'
          ],
          links: [
            {
              label: 'Strategy & Growth Answer Template',
              url: 'https://docs.google.com/document/d/1gn7nn52ELvmTjbDa0EzKeQW8dRjHjx49qd_zxZZ8JK4/edit?usp=sharing',
              badge: 'Google Docs'
            }
          ]
        },
        writingTestDetail: {
          points: [
            'The Personality Writing Test is designed to provide a deeper understanding of each candidate as an individual. While interviews and previous experiences can demonstrate a person\'s achievements and capabilities, this test focuses more on understanding their personality, mindset, values, self-awareness, and perspectives.',
            'Through this assessment, we aim to understand:',
            '• How you perceive yourself and your personal strengths and weaknesses.',
            '• How you approach challenges, uncertainty, and unfamiliar situations.',
            '• How you communicate your thoughts and ideas.',
            '• How you reflect on your experiences and learn from them.',
            '• How you respond to different situations and make decisions.',
            '• Your personal values and the principles that influence your actions.',
            '• How your personality and mindset may contribute to working within a team and organization.',
            'This test is not intended to judge whether your personality is good or bad. Every individual has different perspectives, experiences, and ways of thinking. Therefore, we encourage you to focus on being honest, authentic, and reflective in your responses.',
            'Please do not try to provide answers that you think the organization wants to hear. Instead, provide answers that genuinely represent who you are. Remember, there are no perfect answers. What matters most is the authenticity and thoughtfulness behind your response.'
          ],
          questions: [
            {
              title: 'Question 1',
              prompt: 'Imagine that you are going on a long journey, but you can only bring one of the following: Which one would you choose and why?',
              options: [
                'A. A map',
                'B. A compass',
                'C. A notebook',
                'D. A camera'
              ]
            },
            {
              title: 'Question 2',
              prompt: 'You are given an empty room and complete freedom to transform it. What would you turn it into? Which would you choose and why?',
              options: [
                'A. A workspace',
                'B. A place for people to gather',
                'C. A space for creativity and experimentation',
                'D. A quiet place for reflection'
              ]
            },
            {
              title: 'Question 3',
              prompt: 'Imagine you are part of a crew sailing toward an unknown destination. Which position would you naturally choose and why?',
              options: [
                'A. The Captain : making decisions and determining the direction.',
                'B. The Navigator : analyzing information and determining the best route.',
                'C. The Engineer : ensuring that everything works properly.',
                'D. The Crew Connector : ensuring communication and cooperation within the team.'
              ]
            },
            {
              title: 'Question 4',
              prompt: 'At the end of your journey in an organization, which would you rather be remembered for? Which would you choose and why?',
              options: [
                'A. Creating meaningful results.',
                'B. Helping other people grow.',
                'C. Bringing new ideas and changes.',
                'D. Being someone people could always rely on.'
              ]
            },
            {
              title: 'Question 5 (Open-Ended)',
              prompt: 'If you are an animal, what animal are you and why?'
            }
          ]
        },
        contactPerson: {
          name: 'Rafie',
          phone: '085694477190'
        }
      }
    ]
  },
  {
    id: 'mkt',
    name: 'Marketing',
    shortName: 'Marketing',
    logo: '/logodept/mkt.png',
    tracks: [
      {
        id: 'graphic-design',
        name: 'Graphic Design',
        testDescription: [
          'This test is designed to see how you translate a brief into a finished creative output, from visual storytelling to editing craft. Through this test, we want to understand how you interpret a concept, apply design or editing principles, and bring an idea to life within a set of guidelines.',
          'We are not looking for flawless execution, but what matters is how you approach the brief, apply the 180DC UB style guidelines, and show your own creative sensibility.'
        ],
        testMechanism: {
          points: [
            'Access the Brand Identity guideline provided to understand the visual direction that must be followed.',
            'Read the Brief thoroughly, including the theme, objective, and target audience of the content to be created.',
            'Create the content according to the given brief, covering the theme that aligns with the topic provided, as well as the visualization and layout that follow the 180DC UB design style guidelines.',
            'For Graphic Design, create a feeds post with a maximum of 4 slides.'
          ],
          links: [
            {
              label: 'Brand Guideline (Figma)',
              url: 'https://www.figma.com/design/l4LtB50SsmYNmL9ebfwRt9/BRAND-GUIDELINE---WRITING-TEST?node-id=0-1&t=okDXoMEvTui5Zz3Y-1',
              badge: 'Figma'
            },
            {
              label: 'Brand Guideline (Canva)',
              url: 'https://canva.link/fm6uarg7lqlv73n',
              badge: 'Canva'
            },
            {
              label: 'Writing Test Brief Document',
              url: 'https://docs.google.com/document/d/1stjva7UpXg6XB-cjYse4baCTUSp6sujX9Ozt07taqVE/edit?tab=t.ex8g51sc9wm6',
              badge: 'Google Docs'
            }
          ]
        },
        writingTestDetail: {
          points: [
            'Output : A 4-slide feeds post, submitted in .JPG or .PNG format.',
            'Layout is flexible : You are free to design your own layout, as long as it remains clear and easy to read. There is no fixed template you must follow, feel free to explore as long as the readability and structure of the content are maintained.',
            'The use of AI tools is strictly PROHIBITED : All content, whether design, copy, or video, must be your own original work. Any indication of AI-generated content will result in a 100% deduction from your final score.',
            'Align your content with our brand guideline and the 180DC UB vibe : Make sure the post you create follows our visual identity (logo, color palette, typography) as well as reflects the tone and energy that represent 180DC UB as an organization.',
            'Double check before submitting : Review your content for typos, misalignment, or inconsistencies before you send it in. Small details can affect the overall impression of your work.',
            'Submit your work in the requested file format : Make sure your final output matches the file type and naming format required, so it can be reviewed properly without any issues on our end.',
            'Reach out if you have questions : If anything in the brief is unclear or you run into difficulties along the way, don\'t hesitate to contact us through the provided contact person.'
          ]
        },
        contactPerson: {
          name: 'Nadine',
          phone: '081217313800'
        }
      },
      {
        id: 'motion',
        name: 'Motion',
        testDescription: [
          'This test is designed to see how you translate a brief into a finished creative output, from visual storytelling to editing craft. Through this test, we want to understand how you interpret a concept, apply design or editing principles, and bring an idea to life within a set of guidelines.',
          'We are not looking for flawless execution, but what matters is how you approach the brief, apply the 180DC UB style guidelines, and show your own creative sensibility.'
        ],
        testMechanism: {
          points: [
            'Access the Brand Identity guideline provided to understand the visual direction that must be followed.',
            'Read the Brief thoroughly, including the theme, objective, and target audience of the content to be created.',
            'Create the content according to the given brief, covering the theme that aligns with the topic provided, as well as the visualization and style that follow the 180DC UB video style guidelines.',
            'For Motion, create a video with a maximum duration of 1 minute.'
          ],
          links: [
            {
              label: 'Brand Guideline (Figma)',
              url: 'https://www.figma.com/design/l4LtB50SsmYNmL9ebfwRt9/BRAND-GUIDELINE---WRITING-TEST?node-id=0-1&t=okDXoMEvTui5Zz3Y-1',
              badge: 'Figma'
            },
            {
              label: 'Brand Guideline (Canva)',
              url: 'https://canva.link/fm6uarg7lqlv73n',
              badge: 'Canva'
            },
            {
              label: 'Writing Test Brief Document',
              url: 'https://docs.google.com/document/d/1stjva7UpXg6XB-cjYse4baCTUSp6sujX9Ozt07taqVE/edit?tab=t.ex8g51sc9wm6',
              badge: 'Google Docs'
            }
          ]
        },
        writingTestDetail: {
          points: [
            'Output : A video with 1 minute duration, submitted in .MP4 format.',
            'Layout is flexible : You are free to design your own layout, as long as it remains clear and easy to read. There is no fixed template you must follow, feel free to explore as long as the readability and structure of the content are maintained.',
            'The use of AI tools is strictly PROHIBITED : All content, whether design, copy, or video, must be your own original work. Any indication of AI-generated content will result in a 100% deduction from your final score.',
            'Align your content with our brand guideline and the 180DC UB vibe : Make sure the post you create follows our visual identity (logo, color palette, typography) as well as reflects the tone and energy that represent 180DC UB as an organization.',
            'Double check before submitting : Review your content for typos, misalignment, or inconsistencies before you send it in. Small details can affect the overall impression of your work.',
            'Submit your work in the requested file format : Make sure your final output matches the file type and naming format required, so it can be reviewed properly without any issues on our end.',
            'Reach out if you have questions : If anything in the brief is unclear or you run into difficulties along the way, don\'t hesitate to contact us through the provided contact person.'
          ]
        },
        contactPerson: {
          name: 'Nadine',
          phone: '081217313800'
        }
      },
      {
        id: 'brand-communication',
        name: 'Brand Communication',
        testDescription: [
          'This test is designed to see how you communicate an idea through words and presence, from writing a compelling script to delivering it confidently on camera. Through this test, we want to understand how you craft a message, adapt your tone to a theme, and connect with an audience.',
          'We are not looking for you to be a professional presenter, but what matters is how clearly you communicate, how authentically you present yourself, and how well your script and caption capture the given theme.'
        ],
        testMechanism: {
          points: [
            'Access the content brief template provided to see the format and structure that needs to be followed.',
            'Make a copy of the template by duplicating the content brief page for your own use.',
            'Fill in the brief according to the theme you have chosen, covering the key message and direction of the content you want to create. The theme options:',
            '• Theme 1: What is 180DC UB — Explain what 180 Degrees Consulting UB is, including its purpose, what the organization does, and the impact it has made.',
            '• Theme 2: Marketing Funnel Explanation — Explain each stage of the marketing funnel along with real examples, using simple language that is easy for a general audience to understand.',
            '• Theme 3: Promoting BECOME 180 — Explain what the event is about, why people should join, the impact it aims to create, and the divisions available for participants to be part of.',
            'Take the video, edited or unedited, based on the brief you have filled in.'
          ],
          links: [
            {
              label: 'Content Brief Template',
              url: 'https://docs.google.com/document/d/1stjva7UpXg6XB-cjYse4baCTUSp6sujX9Ozt07taqVE/edit?tab=t.ex8g51sc9wm6',
              badge: 'Google Docs'
            }
          ]
        },
        writingTestDetail: {
          points: [
            'Output : 1 content brief in .PDF format & 1 video implementing the brief in .MP4 format.',
            'Layout is flexible : You are free to design your own layout, as long as it remains clear and easy to read. There is no fixed template you must follow, feel free to explore as long as the readability and structure of the content are maintained.',
            'The use of AI tools is strictly PROHIBITED : All content, whether design, copy, or video, must be your own original work. Any indication of AI-generated content will result in a 100% deduction from your final score.',
            'Double check before submitting : Review your content for typos, misalignment, or inconsistencies before you send it in. Small details can affect the overall impression of your work.',
            'Submit your work in the requested file format : Make sure your final output matches the file type and naming format required, so it can be reviewed properly without any issues on our end.',
            'Reach out if you have questions : If anything in the brief is unclear or you run into difficulties along the way, don\'t hesitate to contact us through the provided contact person.'
          ]
        },
        contactPerson: {
          name: 'Nadine',
          phone: '081217313800'
        }
      }
    ]
  },
  {
    id: 'lnf',
    name: 'Legal & Finance',
    shortName: 'Legal & Finance',
    logo: '/logodept/lnf.png',
    tracks: [
      {
        id: 'legal',
        name: 'Legal',
        testDescription: [
          'This writing test is designed to assess how you think as a Legal Junior Analyst, not how well you remember legal theory. You will be presented with a realistic legal situation that you must resolve. This situation may involve a cooperation agreement document and/or a legal audit case. There is no single right or wrong answer, what matters is how you think and work through the problem using broad, sound considerations.',
          'We are far more interested in how carefully you read, connect, and interpret information than in how you use sophisticated words or diction to sound impressive. Remember, as law graduates, you need to be able to explain things clearly to people without a legal background.'
        ],
        testMechanism: {
          points: [
            'This is an individual written assessment. Do not discuss the case or your answers with other candidates.',
            'Read the case and all supporting information carefully before answering.',
            'Answer all questions in the order provided.',
            'Provide clear reasoning for every recommendation or judgment-based answer, not just a conclusion.',
            'The use of AI tools (e.g., ChatGPT, Claude, Gemini, Copilot) at any point during the test is strictly prohibited. This test is designed to assess your own reasoning.',
            'Don\'t forget to Make a Copy first to do the Legal Additional Test!'
          ],
          links: [
            {
              label: 'Legal & Finance Case Study Document',
              url: 'https://docs.google.com/document/d/1HssvWlyL5t8vF-TAw4HwNW-lKuHq3h9tQOETJaqM9Iw/edit?tab=t.0',
              badge: 'Google Docs Case Study'
            }
          ]
        },
        writingTestDetail: {
          points: [
            'Output format: Typed answers, compiled into a single PDF file',
            'Number of questions: 2 Cases (4 Questions)',
            'Font: Times New Roman',
            'Font size: 12 pt, 1.15 line spacing',
            'AI tool prohibition: Strictly prohibited; suspected use will result in disqualification.',
            'Originality requirement: Work must be entirely your own; identical or near-identical submissions between candidates will be investigated!'
          ],
          links: [
            {
              label: 'Access Case Study',
              url: 'https://docs.google.com/document/d/1HssvWlyL5t8vF-TAw4HwNW-lKuHq3h9tQOETJaqM9Iw/edit?tab=t.0',
              badge: 'Case Study'
            }
          ]
        }
      },
      {
        id: 'finance',
        name: 'Finance',
        testDescription: [
          'This writing test is designed to assess how you think as a Finance Junior Analyst, not how well you remember accounting theory. You will be given a realistic financial situation drawn from the kind of work our Finance Department actually handles, starting from budget monitoring, cash administration, sponsorship follow-up, and internal controls for a student-run consulting program.',
          'Some questions have a single correct numerical answer, while others ask for a professional judgment or recommendation; for those, there is no single "perfect" answer, and multiple recommendations can be considered strong as long as they are supported by clear, financially sound reasoning.',
          'We are far more interested in how carefully you read, connect, and interpret information than in how quickly you can calculate or how much financial terminology you already know.'
        ],
        testMechanism: {
          points: [
            'This is an individual written assessment. Do not discuss the case or your answers with other candidates.',
            'Read the case and all supporting information carefully before answering.',
            'Answer all questions in the order provided.',
            'Show your supporting calculations for any question that requires one. Partial credit is available for correct reasoning even if the final number is off.',
            'Provide clear reasoning for every recommendation or judgment-based answer, not just a conclusion.',
            'The use of AI tools (e.g., ChatGPT, Claude, Gemini, Copilot) at any point during the test is strictly prohibited. This test is designed to assess your own reasoning.',
            'A basic (non-programmable) calculator is allowed for arithmetic.'
          ],
          links: [
            {
              label: 'Legal & Finance Case Study Document',
              url: 'https://docs.google.com/document/d/1HssvWlyL5t8vF-TAw4HwNW-lKuHq3h9tQOETJaqM9Iw/edit?tab=t.0',
              badge: 'Google Docs Case Study'
            }
          ]
        },
        writingTestDetail: {
          points: [
            'Output format: Typed or clearly handwritten (then scanned) answers, compiled into a single PDF file',
            'Number of questions: 6 questions (Q1–Q6)',
            'Approximate word count: 700–900 words (excluding calculations)',
            'Font: Times New Roman',
            'Font size: 12 pt, 1.15 line spacing',
            'Calculation requirement: All supporting calculations must be shown, not just final figures',
            'AI tool prohibition: Strictly prohibited; suspected use will result in disqualification',
            'Originality requirement: Work must be entirely your own; identical or near-identical submissions between candidates will be investigated'
          ],
          links: [
            {
              label: 'Access Case Study',
              url: 'https://docs.google.com/document/d/1HssvWlyL5t8vF-TAw4HwNW-lKuHq3h9tQOETJaqM9Iw/edit?tab=t.0',
              badge: 'Case Study'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'cons',
    name: 'Consulting',
    shortName: 'Consulting',
    logo: '/logodept/cons.png',
    isComingSoon: true,
    tracks: [
      {
        id: 'consulting-general',
        name: 'Consulting',
        isComingSoon: true,
        testDescription: [
          'Coming Soon',
          'The writing test prompt for Consulting is currently being finalized and will be published soon. Please check back later or monitor official notifications.'
        ],
        testMechanism: {
          points: [
            'Coming Soon',
            'Case brief guidelines, deck structure, and submission instructions will be announced soon.'
          ]
        },
        writingTestDetail: {
          points: [
            'Coming Soon',
            'Consulting business problem prompts and deliverables will be updated soon.'
          ]
        }
      }
    ]
  },
  {
    id: 'ca',
    name: 'Client Acquisition',
    shortName: 'Client Acquisition',
    logo: '/logodept/ca.png',
    tracks: [
      {
        id: 'client-relation',
        name: 'Client Relation',
        testDescription: [
          'This test is designed to see how you identify potential clients or partners, develop a partnership strategy, and create value for both sides. Through this test, we want to understand how you think, communicate, and approach potential collaboration opportunities.',
          'There is no single "perfect" strategy for this test. We are not looking for you to already be an expert in partnerships or business development. What matters is how you understand your chosen target, build your approach, and create a collaboration that makes sense for both sides. So, take your time, do your best, and let us see how you think!'
        ],
        testMechanism: {
          points: [
            '1. Choose one potential client or partner that you think could collaborate with 180DC UB. You may choose a: Brand/company, Institution, Community, or MSMEs.',
            '2. Create a mini presentation deck with a maximum of 5 slides, covering:',
            '• Why You Chose Them — Explain why you think they are a relevant potential client or partner for 180DC UB.',
            '• Outreach Approach — Explain how you would approach and introduce 180DC UB to them.',
            '• What We Give — Explain the value or benefits 180DC UB can offer.',
            '• What They Give — Explain the value or benefits you expect from them.',
            '• Expected Outcomes — Explain what you hope to achieve through the collaboration.'
          ]
        },
        writingTestDetail: {
          points: [
            'Output: Mini presentation deck, maximum 5 slides',
            'Target: Choose 1 potential client or partner',
            'Font: No specific requirement',
            'Focus on clear reasoning and a realistic partnership strategy, not just describing the organization you chose.',
            'Your proposed collaboration should create value for both 180DC UB and the selected client/partner.',
            'Make your deck clear, engaging, and visually appealing. Feel free to be creative with your visuals and presentation style, as long as your ideas remain easy to understand.',
            'AI tools may be used only as a supporting tool for research or brainstorming, but the final strategy, ideas, and presentation must reflect your own thinking and understanding.',
            'If you have any questions or encounter difficulties regarding the test, please contact us through WhatsApp.'
          ]
        },
        contactPerson: {
          name: 'Janice',
          phone: '089506570134'
        }
      },
      {
        id: 'knowledge',
        name: 'Knowledge',
        testDescription: [
          'This test is designed to see how you explore a business topic, find relevant information, and develop your own point of view. Through this test, we want to understand how you research, analyze, and communicate your ideas.',
          'There is no single "perfect" answer to this test. We are not looking for you to be an expert. What matters is how you approach the topic, support your ideas with reliable information, and show your own perspective. So, take your time, do your best, and let us see how you think!'
        ],
        testMechanism: {
          points: [
            '1. Choose one topic from the following options:',
            '• Should FIFA Expand the World Cup Beyond 48 Teams?',
            '• Can Indonesia Win the Southeast Asia Data Center Race?',
            '• Is the AI Investment Supercycle a Bubble?',
            '2. Create a presentation deck with a maximum of 8 slides, covering:',
            '• Background of the topic',
            '• Key Findings supported by credible sources',
            '• Personal Insights and/or Recommendations',
            '3. References : Bi-Weekly Research posts on the 180 DC Instagram account or research posts published by other research houses or firms.'
          ]
        },
        writingTestDetail: {
          points: [
            'Output: Presentation deck, maximum 8 slides',
            'Topic: Choose 1 out of 3 provided topics',
            'Font: Times New Roman or Arial',
            'Font size: No specific requirement',
            'Make sure the information, data, and arguments taken from external sources are properly referenced.',
            'Focus on clear analysis and your own perspective, not just summarizing information from different sources.',
            'AI tools may be used only as a supporting tool for research or brainstorming, but the final analysis, insights, and presentation must reflect your own thinking and understanding.',
            'If you have any questions or encounter difficulties regarding the test, please contact us through WhatsApp.'
          ]
        },
        contactPerson: {
          name: 'Marlon',
          phone: '081230671326'
        }
      }
    ]
  }
];
