// src/theme/Layout/index.js
import React from 'react';
import Layout from '@theme-original/Layout';
import ChatbotComponent from '@site/src/components/ChatbotComponent';

export default function LayoutWrapper(props) {
  return (
    <>
      <Layout {...props}>
        {props.children}
        <ChatbotComponent />
      </Layout>
    </>
  );
}