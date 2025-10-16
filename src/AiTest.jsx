import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Card, Tag, Divider } from 'antd';

const { TextArea } = Input;

const SignalingTest = () => {
    const [message, setMessage] = useState('');
    const [conversation, setConversation] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef(null);
    const sessionId = 'test-123'; // 테스트용 세션 ID

    useEffect(() => {
        // Signaling WebSocket 연결
        const ws = new WebSocket(`ws://localhost:9090/ws/signaling/${sessionId}`);

        ws.onopen = () => {
            console.log('WebSocket 연결됨');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('메시지 수신:', data);

            if (data.type === 'connected') {
                console.log('연결 성공:', data.sessionId);
            } else if (data.type === 'OFFER') {
                console.log('Offer 수신:', data.sdp);
                // 테스트용: 자동 Answer 응답 가능
            } else if (data.type === 'ANSWER') {
                console.log('Answer 수신:', data.sdp);
            } else if (data.type === 'ICE_CANDIDATE') {
                console.log('ICE 후보 수신:', data.candidate);
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
    }, [sessionId]);

    const sendMessage = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            if (!message.trim()) {
                alert('메시지를 입력하세요');
                return;
            }

            // 테스트용 텍스트 메시지 전송
            wsRef.current.send(JSON.stringify({
                type: 'ANSWER_MESSAGE',
                content: message
            }));

            // 대화 기록에 추가
            setConversation(prev => [...prev, { user: message }]);
            setMessage('');
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
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <Card>
                <div style={{ marginBottom: '20px' }}>
                    <h1 style={{ margin: 0 }}>Signaling 테스트</h1>
                    <Tag color={isConnected ? 'success' : 'error'} style={{ marginTop: '10px' }}>
                        {isConnected ? '● 연결됨' : '● 연결 끊김'}
                    </Tag>
                </div>

                <Divider />

                <TextArea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="메시지를 입력하세요 (Shift+Enter: 줄바꿈, Enter: 전송)"
                    autoSize={{ minRows: 3, maxRows: 6 }}
                    style={{ marginBottom: '10px' }}
                />
                <Button type="primary" onClick={sendMessage} disabled={!isConnected} block>
                    전송
                </Button>

                <Divider />

                {conversation.length > 0 && (
                    <>
                        <h3>대화 기록</h3>
                        {conversation.map((c, idx) => (
                            <Card key={idx} style={{ marginBottom: '15px' }} size="small">
                                <Tag color="blue">사용자</Tag>
                                <div style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>
                                    {c.user}
                                </div>
                            </Card>
                        ))}
                    </>
                )}
            </Card>
        </div>
    );
};

export default SignalingTest;
