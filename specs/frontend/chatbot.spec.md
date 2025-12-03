# Chatbot Component Specification

## Overview
This document specifies the requirements for the React-based chatbot component that appears on every page of the Docusaurus-based robotics book.

## Component Structure

### Main Component: ChatbotComponent
- **File**: `src/components/ChatbotComponent.tsx`
- **Purpose**: Provide an interactive chat interface on every page
- **Integration**: Override Docusaurus Layout to include the component

## Visual Design Requirements

### 1. Default State (Closed)
- Floating circular button in bottom-right corner
- Icon: Robot face (🤖) or chat bubble
- Size: 60px diameter
- Background color: #25c2a0 (theme color)
- Drop shadow: subtle shadow for depth
- Smooth transition animations

### 2. Open State
- Width: 350px (responsive)
- Height: 500px (responsive)
- Border-radius: 8px
- Background: white
- Shadow: 8px 8px 30px rgba(0,0,0,0.12)

### 3. Header Section
- Background: #25c2a0 (theme color)
- Height: 50px
- Title: "Robotics Assistant"
- Text: White, 16px font
- Close button: (✕) in top-right corner

### 4. Message Display Area
- Flexible height with scroll
- Background: #f9f9f9
- Padding: 15px
- Gap: 12px between messages

### 5. Message Styling
- **User Messages**: Green background (#25c2a0), white text, right-aligned
- **Bot Messages**: White background with border, #333 text, left-aligned
- **Typing Indicators**: Animated dots for bot responses
- **Timestamps**: 11px text, gray color, right-aligned

### 6. Input Area
- Background: white
- Border-top: 1px solid #eee
- Height: 80px
- Padding: 12px
- Textarea: Border, 18px border-radius, padding 10px 15px
- Send button: Same color as header, white text

## Functional Requirements

### 1. Text Selection Detection
- Detect when user selects text on any page
- Store selected text in component state
- Show action buttons when meaningful text is selected (>10 characters)
- Clear selection when user clicks elsewhere

### 2. Intent-Based Actions
When text is selected, display action buttons:
- **"Summarize"**: Generate a concise summary
- **"Mind Map"**: Create visual representation (text-based)
- **"Explain Simply"**: Simplify complex concepts
- **"Key Points"**: Extract important information

### 3. Conversation Management
- Maintain message history in component state
- Support for multiple concurrent conversations
- Clear conversation history option
- Scroll to bottom when new messages arrive

### 4. API Communication
- POST requests to backend API endpoint: `/api/chat/`
- Proper error handling for failed requests
- Loading states during processing
- Retry functionality for failed messages

### 5. Input Handling
- Textarea with multi-line support (2 rows by default)
- Enter key sends message (with Shift+Enter for new line)
- Input validation before sending
- Auto-resizing based on content

## User Experience Requirements

### 1. Accessibility
- Keyboard navigation support (Tab, Enter, Escape)
- Screen reader compatibility with ARIA labels
- Sufficient color contrast (4.5:1 minimum)
- Focus indicators for interactive elements
- Alternative text for all icons

### 2. Responsiveness
- Mobile-friendly layout (300px minimum width)
- Touch-friendly controls (44px minimum touch targets)
- Adaptive positioning for different screen sizes
- Optimized for vertical scrolling

### 3. Performance
- Fast open/close animations (≤300ms)
- Efficient rendering of message history
- Minimal impact on page performance
- Optimized API calls to prevent excessive requests

## Interaction Flows

### 1. Opening the Chat
- Clicking the floating button opens the chat window
- Button transforms to match the top of the chat window
- Initial greeting message appears automatically
- Welcome message explains capabilities

### 2. Sending a Message
- User types in the text area
- Clicking send button or pressing Enter sends message
- Message appears in conversation history as user message
- Loading indicator appears while processing
- Response appears as assistant message

### 3. Text Selection Flow
- User selects text on any page
- Action buttons appear with "What would you like to do with selected text?"
- User selects an action (summarize, explain, etc.)
- Appropriate query is formed and sent to backend
- Response is displayed in the chat

### 4. Error Handling
- Network errors show appropriate messages
- API errors are displayed in chat
- Retry option available for failed messages
- User can continue conversation despite errors

## State Management

### Component State Fields
- `isOpen`: boolean - Controls chat window visibility
- `messages`: array - Conversation history
- `inputValue`: string - Current input value
- `isLoading`: boolean - API processing state
- `selectedText`: string - Currently selected text
- `showActions`: boolean - Show action buttons for selected text
- `userIntent`: string - User's selected intent for selected text

### State Transitions
- Correctly update UI based on state changes
- Preserve state across component re-renders
- Handle asynchronous operations properly
- Maintain user's position in conversation

## API Integration

### 1. Request Format
```json
{
  "question": "user question",
  "context_text": "selected text or null",
  "user_id": "session identifier",
  "conversation_id": "conversation identifier"
}
```

### 2. Response Handling
- Parse JSON response from backend
- Update message history with response
- Handle different response types gracefully
- Maintain conversation context

### 3. Error Handling
- Handle network errors appropriately
- Display user-friendly error messages
- Maintain conversation state during errors
- Provide retry mechanisms

## Styling Requirements

### 1. Theme Consistency
- Match Docusaurus color scheme
- Use consistent font families
- Follow Docusaurus design principles
- Maintain visual hierarchy

### 2. Animation and Transitions
- Smooth open/close animations
- Loading state animations
- Message appearance transitions
- Hover effects on interactive elements

### 3. Responsive Design
- Adapts to different screen sizes
- Maintains usability on mobile
- Appropriate spacing and sizing
- Touch-friendly controls

## Security Considerations

### 1. Data Security
- Secure communication with backend (HTTPS)
- Sanitize user inputs before sending
- Protect against XSS in message display
- Validate API responses

### 2. Privacy Protection
- Anonymize user data where possible
- Respect user privacy preferences
- Provide clear data handling notices
- Comply with privacy regulations

## Testing Requirements

### 1. Unit Tests
- Test component rendering
- Test state management
- Test API interaction mocks
- Test event handlers

### 2. Integration Tests
- Test API communication
- Test with real backend endpoints
- Test error handling scenarios
- Test cross-component interactions

### 3. Accessibility Tests
- Screen reader compatibility
- Keyboard navigation
- Color contrast validation
- ARIA attribute validation

## Performance Metrics

### 1. Load Performance
- Component should render in <50ms
- No impact on page load time
- Efficient state updates
- Optimized rendering cycles

### 2. Interaction Performance
- Open/close animations <300ms
- Message appearance <100ms
- Smooth scrolling performance
- Responsive input handling