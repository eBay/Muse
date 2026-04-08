import React from 'react';
import { Card, List, Button, Empty, Typography, Space } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ClockCircleOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const TestPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const recentlyViewedUsers = useSelector(state => state.pluginUsersPlugin?.recentlyViewedUsers || []);

  const handleClearList = () => {
    dispatch({ type: 'clear-recently-viewed' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) {
      return '刚刚';
    }
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`;
    }
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    }
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={
          <Space>
            <ClockCircleOutlined />
            <span>最近访问的用户</span>
          </Space>
        }
        bordered={false}
        extra={
          recentlyViewedUsers.length > 0 && (
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              onClick={handleClearList}
            >
              清空列表
            </Button>
          )
        }
      >
        {recentlyViewedUsers.length === 0 ? (
          <Empty 
            description="暂无访问记录"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={recentlyViewedUsers}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/users/${item.id}`)}
                actions={[
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {formatTime(item.timestamp)}
                  </Text>
                ]}
              >
                <List.Item.Meta
                  avatar={<UserOutlined style={{ fontSize: '20px', color: '#1890ff' }} />}
                  title={
                    <Text strong style={{ fontSize: '16px' }}>
                      {item.name}
                    </Text>
                  }
                  description={`用户ID: ${item.id}`}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default TestPage;
