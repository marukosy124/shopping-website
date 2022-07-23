import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';

interface ImageWrapperProps {
  src?: string;
  className?: any;
}

const useStyles = makeStyles((theme: Theme) => ({
  imageWrapper: {
    textAlign: 'center',
    justifyContent: 'center',
    color: theme.palette.grey[600],
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    width: 200,
    height: 200,
  },
}));

const ImageWrapper: React.FC<ImageWrapperProps> = (props) => {
  const classes = useStyles(props);

  return (
    <div
      className={clsx(classes.imageWrapper, props.className)}
      style={
        props.src
          ? {
              backgroundImage: `url(${props.src})`,
              backgroundSize: 'cover',
              backgroundPosition: '50%',
            }
          : {
              boxShadow: '0 0 3px grey',
            }
      }
    >
      {!props.src && 'No image available'}
    </div>
  );
};

export default ImageWrapper;
