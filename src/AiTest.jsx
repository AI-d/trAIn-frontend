import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Card, Tag, Divider } from 'antd';

const { TextArea } = Input;

const AiJsonTest = () => {
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [conversation, setConversation] = useState([]);
    const wsRef = useRef(null);

    useEffect(() => {
        // WebSocket 연결
        const ws = new WebSocket('ws://localhost:9090/ws/openai');

        ws.onopen = () => {
            console.log('WebSocket 연결됨');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('메시지 수신:', data);

            if (data.type === 'connected') {
                console.log('연결 성공:', data.sessionId);
            } else if (data.type === 'stream') {
                // 스트리밍 데이터를 기존 응답에 추가
                setResponse(prev => prev + data.content);
            } else if (data.type === 'done') {
                console.log('스트리밍 완료');
                // 대화 기록에 추가
                setConversation(prev => [
                    ...prev,
                    { user: message, ai: response }
                ]);
            } else if (data.type === 'error') {
                console.error('에러:', data.message);
                alert('에러: ' + data.message);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket 에러:', error);
            setIsConnected(false);
        };

        ws.onclose = () => {
            console.log('WebSocket 연결 종료');
            setIsConnected(false);
        };

        wsRef.current = ws;

        return () => {
            ws.close();
        };
    }, []);

    const sendMessage = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            if (!message.trim()) {
                alert('메시지를 입력하세요');
                return;
            }

            // 응답 초기화
            setResponse('');

            // 메시지 전송
            wsRef.current.send(JSON.stringify({
                message: message
            }));

            console.log('메시지 전송:', message);
        } else {
            alert('WebSocket이 연결되지 않았습니다.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            <Card>
                <div style={{ marginBottom: '20px' }}>
                    <h1 style={{ margin: 0 }}>AI WebSocket 채팅 테스트</h1>
                    <Tag color={isConnected ? 'success' : 'error'} style={{ marginTop: '10px' }}>
                        {isConnected ? '● 연결됨' : '● 연결 끊김'}
                    </Tag>
                </div>

                <Divider />

                {/* 입력 영역 */}
                <div style={{ marginBottom: '20px' }}>
                    <TextArea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="메시지를 입력하세요 (Shift+Enter: 줄바꿈, Enter: 전송)"
                        autoSize={{ minRows: 3, maxRows: 6 }}
                        style={{ marginBottom: '10px' }}
                    />
                    <Button
                        type="primary"
                        onClick={sendMessage}
                        disabled={!isConnected}
                        block
                    >
                        전송
                    </Button>
                </div>

                <Divider />

                {/* 실시간 응답 영역 */}
                {response && (
                    <Card
                        title="AI 응답 (실시간)"
                        style={{ marginBottom: '20px', backgroundColor: '#f0f2f5' }}
                    >
                        <div style={{ whiteSpace: 'pre-wrap', minHeight: '100px' }}>
                            {response}
                        </div>
                    </Card>
                )}

                {/* 대화 기록 */}
                {conversation.length > 0 && (
                    <>
                        <h3>대화 기록</h3>
                        {conversation.map((c, idx) => (
                            <Card
                                key={idx}
                                style={{ marginBottom: '15px' }}
                                size="small"
                            >
                                <div style={{ marginBottom: '10px' }}>
                                    <Tag color="blue">사용자</Tag>
                                    <div style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>
                                        {c.user}
                                    </div>
                                </div>
                                <Divider style={{ margin: '10px 0' }} />
                                <div>
                                    <Tag color="green">AI</Tag>
                                    <div style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>
                                        {c.ai}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </>
                )}
            </Card>
        </div>
    );
};

export default AiJsonTest;