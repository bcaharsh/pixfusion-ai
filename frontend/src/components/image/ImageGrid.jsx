import ImageCard from './ImageCard'

const ImageGrid = ({ images, onDelete, showActions }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((image) => (
        <ImageCard
          key={image._id}
          image={image}
          onDelete={onDelete}
          showActions={showActions}
        />
      ))}
    </div>
  )
}

export default ImageGrid