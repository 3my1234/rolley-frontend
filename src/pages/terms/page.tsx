import ReactMarkdown from 'react-markdown';
import termsContent from '../../../../TERMS_OF_SERVICE.md?raw';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white/5 backdrop-blur-lg border-white/10 rounded-lg shadow-lg p-8">
          <div className="prose prose-gray max-w-none text-white">
            <ReactMarkdown>{termsContent}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}


