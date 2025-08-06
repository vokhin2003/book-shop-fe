interface NotificationContentProps {
  title: string;
  body: string;
  image?: string;
  url?: string;
}

export const NotificationMessage: React.FC<
  Pick<NotificationContentProps, "title" | "image">
> = ({ title, image }) => (
  <div style={{ display: "flex", alignItems: "center" }}>
    {image && (
      <img
        src={image}
        alt="notification"
        style={{
          width: 48,
          height: 48,
          marginRight: 12,
          borderRadius: 6,
          objectFit: "cover",
        }}
      />
    )}
    <span>{title}</span>
  </div>
);

export const NotificationDescription: React.FC<
  Pick<NotificationContentProps, "body" | "url">
> = ({ body, url }) => (
  <div>
    <div>{body}</div>
    {url && (
      <a
        href={url}
        style={{ color: "#1677ff", fontWeight: 500 }}
        onClick={(e) => {
          e.preventDefault();
          window.location.href = url;
        }}
      >
        Xem chi tiết đơn hàng
      </a>
    )}
  </div>
);
