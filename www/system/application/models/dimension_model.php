<?
class Dimension_model extends Model {
    
    function __construct()
    {
        parent::Model();
        $this->load->model('Aspect_model','Aspect',TRUE);
    }
    
    
    
    function createfind($width,$height)
    {
        $Dimension['dimension_x'] = $width;
        $Dimension['dimension_y'] = $height;
        $this->db->where($Dimension);
//                        die('foo');
        $query = $this->db->get( 'dimensions' );
        if ( $query->num_rows == 0)
        {
                $this->db->insert('dimensions', $Dimension);
                $Dimension['id'] = $this->db->insert_id();
        }
        else
        {
                $Dimension = $query->row_array();
        }
        $Dimension['aspect'] = $this->Aspect->bestfit( $Dimension['dimension_x'], $Dimension['dimension_y'] );
        return $Dimension;
    }
    
    
    
   function find($id)
   {
      $Dimension['id'] = $id;
      $this->db->where($Dimension);
      $query = $this->db->get( 'dimensions' );
      $Dimension = $query->row_array();
      $Dimension['aspect'] = $this->Aspect->bestfit( $Dimension['dimension_x'], $Dimension['dimension_y'] );
      return $Dimension;
   }
}
?>
