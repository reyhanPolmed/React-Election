function Card({ children, className = "", ...props }) {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  )
}

function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={`card-header ${className}`} {...props}>
      {children}
    </div>
  )
}

function CardContent({ children, className = "", ...props }) {
  return (
    <div className={`card-content ${className}`} {...props}>
      {children}
    </div>
  )
}

function CardTitle({ children, className = "", ...props }) {
  return (
    <h3 className={`card-title ${className}`} {...props}>
      {children}
    </h3>
  )
}

function CardDescription({ children, className = "", ...props }) {
  return (
    <p className={`card-description ${className}`} {...props}>
      {children}
    </p>
  )
}

Card.Header = CardHeader
Card.Content = CardContent
Card.Title = CardTitle
Card.Description = CardDescription

export default Card
