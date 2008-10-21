<?
class Login_model extends Model {

   function __construct()
   {
      parent::Model();
   }
   
   
   
   function find($id)
   {
      $this->db->where('id='.$id);
      $query = $this->db->get( 'users' );
      return $query->row_array();
   }
   

   
   function delete($id)
   {
      $this->db->delete( 'users', 'id='.$id );
   }
   
   
   
   function get_all()
   {
      $query = $this->db->get('users');
      return $query->result_array();
   }



   function create($username, $secret)
   {
      return $this->insert($username, $secret);
   }



   function insert($username, $secret)
   {
      $User['username'] = $username;
      $User['secret'] = md5($secret);
      $this->db->where($User);
      $query = $this->db->get('users');
      if( $query->num_rows() == 1 )
      {
         return $query->row_array();
      }
      $this->db->insert( 'users', $User );
      $User['id'] = $this->db->insert_id();
      return $User;
   }



   function save($User)
   {
      return $this->update($User['id'], 
                           $User['username'], 
                           isset($User['secret']) ? $User['secret'] : null, 
                           $User['customer_id']=='null' ? null : $User['customer_id']);
   }
   
   function update($id, $username, $secret, $customer_id)
   {
      $User['id'] = $id;
      $this->db->where($User);
      $User['username'] = $username;
      if( isset($secret) )
      {
         $User['secret'] = md5($secret);
      }
      $User['customer_id'] = $customer_id;
      $this->db->update('users', $User);
   }

}
?>
